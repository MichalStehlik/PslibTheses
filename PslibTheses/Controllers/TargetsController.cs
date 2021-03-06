using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PslibTheses.Data;
using PslibTheses.Model;
using PslibTheses.ViewModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TargetsController : ControllerBase
    {
        private readonly ThesesContext _context;

        public TargetsController(ThesesContext context)
        {
            _context = context;
        }

        // GET: Targets
        /// <summary>
        /// Gets list of targets satisfying parameters.
        /// </summary>
        /// <param name="search">If Text of record contains this text, this record will be returned.</param>
        /// <param name="text">If Text of record contains this text, this record will be returned.</param>
        /// <param name="order">Sorting order of result - valid values are: text, text_desc, id, id_desc</param>
        /// <param name="page">Index of currently returned page of result. Starts with 0, which is default value.</param>
        /// <param name="pagesize">Size of returned page. Default is 0. If 0, no paging is performed.</param>
        /// <returns>
        /// anonymous object: {
        /// total = amount of all targets,
        /// filtered = number of records after filter was applied,
        /// count = number of records after filter and paging was applied,
        /// page = index of returned page,
        /// pages = count of pages for applied filter, returns 0 if no paging was requested,
        /// data = list of targets
        /// }
        /// </returns>
        [HttpGet]
        [Authorize]
        public ActionResult<IEnumerable<Target>> GetTargets(
            string search = null,
            string text = null,
            string order = "text",
            int page = 0,
            int pagesize = 0)
        {
            IQueryable<TargetVM> targets = _context.Targets.Select(t =>
                new TargetVM
                {
                    Id = t.Id,
                    Text = t.Text,
                    Color = t.Color
                }
            );
            int total = targets.CountAsync().Result;
            if (!String.IsNullOrEmpty(search))
                targets = targets.Where(t => (t.Text.Contains(search)));
            if (!String.IsNullOrEmpty(text))
                targets = targets.Where(t => (t.Text.Contains(text)));
            int filtered = targets.CountAsync().Result;
            targets = order switch
            {
                "text" => targets.OrderBy(t => t.Text),
                "text_desc" => targets.OrderByDescending(t => t.Text),
                "id_desc" => targets.OrderByDescending(t => t.Id),
                _ => targets.OrderBy(t => t.Id),
            };
            if (pagesize != 0)
            {
                targets = targets/*.Skip(page * pagesize)*/.Take(pagesize);
            }
            var result = targets.ToList();
            int count = result.Count;
            return Ok(new { total, filtered, count, page, pages = ((pagesize == 0) ? 0 : Math.Ceiling((double)filtered / pagesize)), data = result });
        }

        // GET: Targets/5
        /// <summary>
        /// Gets data of one target specified by his Id
        /// </summary>
        /// <param name="id">Target Id</param>
        /// <returns>Target</returns>
        [HttpGet("{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<Target>> GetTarget(int id)
        {
            var target = await _context.Targets.FindAsync(id);

            if (target == null)
            {
                return NotFound();
            }

            return target;
        }

        // PUT: Targets/5
        /// <summary>
        /// Overwrites data of target specified by his Id
        /// </summary>
        /// <param name="id">Target Id</param>
        /// <param name="target">Target data</param>
        /// <returns>HTTP 204, 404, 400</returns>
        [HttpPut("{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<IActionResult> PutTarget(int id, TargetIM input)
        {
            if (id != input.Id)
            {
                return BadRequest();
            }

            var target = _context.Targets.Find(id);
            target.Text = input.Text;
            target.Color = ColorTranslator.FromHtml(input.Color);

            _context.Entry(target).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TargetExists(id))
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

        // POST: Targets
        /// <summary>
        /// Creates and stores a new target
        /// </summary>
        /// <param name="target">Target data</param>
        /// <returns>HTTP 201</returns>
        [HttpPost]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<Target>> PostTarget(TargetIM input)
        {
            Target target = new()
            {
                Text = input.Text,
                Color = ColorTranslator.FromHtml(input.Color),
            };
            _context.Targets.Add(target);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetTarget", new { id = target.Id }, target);
        }

        // DELETE: Targets/5
        /// <summary>
        /// Deletes one target specified by its Id
        /// </summary>
        /// <param name="id">Target id</param>
        /// <returns>Target data if success, HTTP 404 if not found</returns>
        [HttpDelete("{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<Target>> DeleteTarget(int id)
        {
            var target = await _context.Targets.FindAsync(id);
            if (target == null)
            {
                return NotFound();
            }

            _context.Targets.Remove(target);
            await _context.SaveChangesAsync();

            return target;
        }

        /// <summary>
        /// Check if target with Id exists.
        /// </summary>
        /// <param name="id">Target id</param>
        /// <returns>boolean</returns>
        private bool TargetExists(int id)
        {
            return _context.Targets.Any(e => e.Id == id);
        }
    }
}
