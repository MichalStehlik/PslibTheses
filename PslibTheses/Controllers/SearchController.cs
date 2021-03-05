using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PslibTheses.Data;
using PslibTheses.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ThesesContext _context;

        public SearchController(ThesesContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<SearchResult>> GetResults(
                string search = null,
                int limit = 15,
                bool ideas = true,
                bool works = true,
                bool users = true,
                bool sets = false
            )
        {
            IEnumerable<SearchResult> query = new List<SearchResult>();
            if (!String.IsNullOrEmpty(search))
            {
                if (ideas)
                {
                    IQueryable<SearchResult> foundIdeas = _context.Ideas
                        .Where(i => i.Name.Contains(search))
                        .Select(i => new SearchResult { Id = i.Id.ToString(), Name = i.Name, Description = i.Subject, SearchedTerm = search, Type = SearchResultType.Idea });
                    query = query.Union(foundIdeas).ToList();
                }
                if (works)
                {
                    IQueryable<SearchResult> foundWorks = _context.Works
                        .Include(w => w.Set)
                        .Include(w => w.Author)
                        .Where(w => w.Name.Contains(search))
                        .Select(w => new SearchResult { Id = w.Id.ToString(), Name = w.Name, Description = w.Set.Name + ", " + w.Author.Name, SearchedTerm = search, Type = SearchResultType.Work });
                    query = query.Union(foundWorks).ToList();
                }
                if (sets)
                {
                    IQueryable<SearchResult> foundSets = _context.Sets
                        .Where(s => s.Name.Contains(search))
                        .Select(s => new SearchResult { Id = s.Id.ToString(), Name = s.Name, Description = s.Year.ToString(), SearchedTerm = search, Type = SearchResultType.Set });
                    query = query.Union(foundSets).ToList();
                }
                if (users)
                {
                    IQueryable<SearchResult> foundUsers = _context.Users
                        .Where(u => u.FirstName.Contains(search) || u.LastName.Contains(search))
                        .Select(u => new SearchResult { Id = u.Id.ToString(), Name = u.Name, Description = u.Email, SearchedTerm = search, Type = SearchResultType.User });
                    query = query.Union(foundUsers).ToList();
                }
            }

            return Ok(query.Take(limit).OrderBy(f => f.Name).ToList());
        }

        [HttpGet("stats")]
        public ActionResult GetStatistics()
        {
            int ideasCount = _context.Ideas.Count();
            int worksCount = _context.Works.Count();
            int setsCount = _context.Sets.Count();
            int usersCount = _context.Users.Count();
            return Ok(new { Ideas = ideasCount, Works = worksCount, Sets = setsCount, Users = usersCount });
        }

    }
}
