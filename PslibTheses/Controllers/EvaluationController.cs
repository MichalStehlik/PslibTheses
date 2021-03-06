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
    [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
    public class EvaluationController : ControllerBase
    {
        private readonly ThesesContext _context;

        public EvaluationController(ThesesContext context)
        {
            _context = context;
        }
        [HttpGet]
        public ActionResult<IEnumerable<Set>> GetSets(
            string search = null,
            string name = null,
            bool? active = null,
            int? year = null,
            string order = "year_desc",
            int page = 0,
            int pagesize = 0)
        {
            IQueryable<SetEvaluationListVM> sets = _context.Sets.Include(s => s.Works).Select(s =>
                new SetEvaluationListVM
                {
                    Id = s.Id,
                    Name = s.Name,
                    Active = s.Active,
                    Year = s.Year,
                    WorksCount = s.Works.Count
                }
            );
            int total = sets.CountAsync().Result;
            if (!String.IsNullOrEmpty(search))
                sets = sets.Where(t => (t.Name.Contains(search)));
            if (!String.IsNullOrEmpty(name))
                sets = sets.Where(t => (t.Name.Contains(name)));
            if (active != null)
                sets = sets.Where(t => (t.Active == active));
            if (year != null)
                sets = sets.Where(t => (t.Year == year));
            int filtered = sets.CountAsync().Result;

            sets = order switch
            {
                "name" => sets.OrderBy(t => t.Name),
                "name_desc" => sets.OrderByDescending(s => s.Name),
                "id" => sets.OrderBy(s => s.Id),
                "year_desc" => sets.OrderBy(s => s.Active).OrderByDescending(s => s.Year),
                _ => sets.OrderBy(s => s.Active).OrderBy(s => s.Year),
            };
            if (pagesize != 0)
            {
                sets = sets.Skip(page * pagesize).Take(pagesize);
            }
            var result = sets.ToList();
            int count = result.Count;

            return Ok(new { total, filtered, count, page, pages = ((pagesize == 0) ? 0 : Math.Ceiling((double)filtered / pagesize)), data = result });
        }
    }
}
