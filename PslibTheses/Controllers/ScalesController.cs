using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PslibTheses.Data;
using PslibTheses.Model;
using PslibTheses.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScalesController : ControllerBase
    {
        private readonly ThesesContext _context;

        public ScalesController(ThesesContext context)
        {
            _context = context;
        }

        // GET: Scales
        [HttpGet]
        public ActionResult<IEnumerable<Scale>> GetScales(
            string search = null,
            string name = null,
            string order = "name",
            int page = 0,
            int pagesize = 0)
        {
            IQueryable<ScaleListVM> scales = _context.Scales.Include(s => s.ScaleValues).Include(s => s.Sets).Select(s =>
                new ScaleListVM
                {
                    Id = s.Id,
                    Name = s.Name,
                    Grades = s.ScaleValues.Count,
                    Sets = s.Sets.Count
                }
            );
            int total = scales.CountAsync().Result;
            if (!String.IsNullOrEmpty(search))
                scales = scales.Where(s => (s.Name.Contains(search)));
            if (!String.IsNullOrEmpty(name))
                scales = scales.Where(s => (s.Name.Contains(name)));
            int filtered = scales.CountAsync().Result;

            scales = order switch
            {
                "name_desc" => scales.OrderByDescending(s => s.Name),
                _ => scales.OrderBy(t => t.Name),
            };
            if (pagesize != 0)
            {
                scales = scales.Skip(page * pagesize).Take(pagesize);
            }
            var result = scales.ToList();
            int count = result.Count;

            return Ok(new { total, filtered, count, page, pages = ((pagesize == 0) ? 0 : Math.Ceiling((double)filtered / pagesize)), data = result });
        }

        // GET: Scales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ScaleListVM>> GetScale(int id)
        {
            var scale = await _context.Scales.Include(s => s.Sets).Include(s => s.ScaleValues).Where(s => s.Id == id).FirstOrDefaultAsync();

            if (scale == null)
            {
                return NotFound();
            }

            return new ScaleListVM { Id = scale.Id, Name = scale.Name, Grades = scale.ScaleValues.Count, Sets = scale.Sets.Count };
        }

        [Authorize(Policy = "Administrator")]
        // PUT: Scales/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutScale(int id, Scale scale)
        {
            if (id != scale.Id)
            {
                return BadRequest();
            }

            _context.Entry(scale).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScaleExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: Scales
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<Scale>> PostScale(Scale scale)
        {
            _context.Scales.Add(scale);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetScale", new { id = scale.Id }, scale);
        }

        // DELETE: Scales/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<Scale>> DeleteScale(int id)
        {
            var scale = await _context.Scales.FindAsync(id);
            if (scale == null)
            {
                return NotFound();
            }

            _context.Scales.Remove(scale);
            await _context.SaveChangesAsync();

            return scale;
        }

        private bool ScaleExists(int id)
        {
            return _context.Scales.Any(e => e.Id == id);
        }

        [HttpGet("{id}/values")]
        public ActionResult<IEnumerable<ScaleValue>> GetScaleValues(int id)
        {
            if (!ScaleExists(id))
            {
                return NotFound("scale container not found");
            }

            var scaleValues = _context.ScaleValues
                .Where(sv => sv.ScaleId == id)
                .OrderByDescending(sv => sv.Rate)
                .AsNoTracking();
            return Ok(scaleValues);
        }

        [HttpGet("{id}/values/{rate}")]
        public async Task<ActionResult<ScaleValue>> GetScaleValue(int id, double rate)
        {
            var @scale = await _context.Scales.FindAsync(id);
            if (@scale == null)
            {
                return NotFound("scale not found");
            }
            var @value = await _context.ScaleValues.Where(sv => sv.ScaleId == id && sv.Rate == rate).FirstOrDefaultAsync();
            if (@value == null)
            {
                return NotFound("scale value not found");
            }
            return @value;
        }

        [HttpDelete("{id}/values/{rate}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<ScaleValue>> DeleteScaleValue(int id, double rate)
        {
            var scale = await _context.Scales.FindAsync(id);
            if (scale == null)
            {
                return NotFound("scale not found");
            }
            var @value = await _context.ScaleValues.Where(sv => sv.ScaleId == id && sv.Rate == rate).FirstOrDefaultAsync();
            if (@value == null)
            {
                return NotFound("scale value not found");
            }
            _context.ScaleValues.Remove(value);
            await _context.SaveChangesAsync();
            return value;
        }

        [HttpPost("{id}/values")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetTerm>> PostScaleValues(int id, [FromBody] ScaleValue sv)
        {
            var scale = await _context.Scales.FindAsync(id);
            if (scale == null)
            {
                return NotFound("scale not found");
            }
            if (id != sv.ScaleId)
            {
                return BadRequest();
            }
            sv.ScaleId = id;
            _context.ScaleValues.Add(sv);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetScaleValue", new { id = sv.ScaleId, rate = sv.Rate }, sv);
        }
    }
}
