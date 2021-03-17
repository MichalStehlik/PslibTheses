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

        [HttpGet("{setId}")]
        public ActionResult<IEnumerable<WorkEvaluationListVM>> GetWorks(
            int setId, 
            string name,
            string classname,
            Guid? evaluatorId,
            string authorfirstname,
            string authorlastname,
            string managerfirstname,
            string managerlastname,
            string order = "classname",
            int page = 0,
            int pagesize = 0)
        {
            IQueryable<WorkEvaluationListVM> works = _context.Works
                .Where(w => w.SetId == setId)
                .Include(w => w.Author)
                .Include(w => w.Manager)
                .Include(w => w.Roles)
                .ThenInclude(r => r.SetRole)
                .Select(w => new WorkEvaluationListVM 
            {
                Id = w.Id,
                Name = w.Name,
                AuthorId = w.AuthorId,
                AuthorFirstName = w.Author.FirstName,
                AuthorLastName = w.Author.LastName,
                ManagerFirstName = w.Manager.FirstName,
                ManagerLastName = w.Manager.LastName,
                ManagerId = w.ManagerId,
                SetId = w.SetId,
                ClassName = w.ClassName,
                State = w.State
            });
            int total = works.CountAsync().Result;
            if (!String.IsNullOrEmpty(name))
                works = works.Where(w => (w.Name.Contains(name)));
            if (!String.IsNullOrEmpty(classname))
                works = works.Where(w => (w.ClassName.Contains(classname)));
            if (!String.IsNullOrEmpty(authorfirstname))
                works = works.Where(w => (w.AuthorFirstName.Contains(authorfirstname)));
            if (!String.IsNullOrEmpty(authorlastname))
                works = works.Where(w => (w.AuthorLastName.Contains(authorlastname)));
            if (!String.IsNullOrEmpty(managerfirstname))
                works = works.Where(w => (w.ManagerFirstName.Contains(managerfirstname)));
            if (!String.IsNullOrEmpty(managerlastname))
                works = works.Where(w => (w.ManagerLastName.Contains(managerlastname)));
            int filtered = works.CountAsync().Result;
            works = order switch
            {
                "name" => works.OrderBy(w => w.Name),
                "name_desc" => works.OrderByDescending(w => w.Name),
                "classname" => works.OrderBy(w => w.ClassName),
                "classname_desc" => works.OrderByDescending(w => w.ClassName),
                "id" => works.OrderBy(w => w.Id),
                _ => works.OrderBy(w => w.ClassName)
            };
            if (pagesize != 0)
            {
                works = works.Skip(page * pagesize).Take(pagesize);
            }
            var result = works.ToList();
            int count = result.Count;

            return Ok(new { total, filtered, count, page, pages = ((pagesize == 0) ? 0 : Math.Ceiling((double)filtered / pagesize)), data = result });
        }
    }
}
