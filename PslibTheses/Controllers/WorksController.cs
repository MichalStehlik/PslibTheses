using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PslibTheses.Data;
using PslibTheses.Model;
using PslibTheses.Prints.ViewModels;
using PslibTheses.Services;
using PslibTheses.ViewModels;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace PslibTheses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorksController : ControllerBase
    {
        private readonly ThesesContext _context;
        private readonly RazorViewToStringRenderer _razorRenderer;
        private readonly IConfiguration _configuration;
        //private readonly EmailSender _emailSender;
        private readonly IAuthorizationService _authorizationService;

        private readonly Dictionary<WorkState, List<WorkState>> _stateTransitions = Definitions.StateTransitions;

        public WorksController(ThesesContext context, RazorViewToStringRenderer razorRenderer, IConfiguration configuration, /*EmailSender emailSender,*/ IAuthorizationService authorizationService)
        {
            _context = context;
            _razorRenderer = razorRenderer;
            _configuration = configuration;
            //_emailSender = emailSender;
            _authorizationService = authorizationService;
        }
        // GET: Work
        [HttpGet]
        public ActionResult<IEnumerable<WorkListVM>> GetWorks(
            string search = null,
            string name = null,
            string subject = null,
            Guid? authorId = null,
            Guid? managerId = null,
            Guid? userId = null,
            string firstname = null,
            string lastname = null,
            string managerfirstname = null,
            string managerlastname = null,
            int? setId = null,
            int? year = null,
            string classname = null,
            string setName = null,
            WorkState? state = null,
            string order = "name",
            int page = 0,
            int pagesize = 0)
        {
            IQueryable<Work> works = _context.Works
                .Include(i => i.Author)
                .Include(i => i.Manager)
                .Include(i => i.Set);
            int total = works.CountAsync().Result;
            if (!String.IsNullOrEmpty(search))
                works = works.Where(i => (i.Name.Contains(search)));
            if (!String.IsNullOrEmpty(name))
                works = works.Where(i => (i.Name.Contains(name)));
            if (!String.IsNullOrEmpty(subject))
                works = works.Where(i => (i.Subject.Contains(subject)));
            if (!String.IsNullOrEmpty(firstname))
                works = works.Where(i => (i.Author.FirstName.Contains(firstname)));
            if (!String.IsNullOrEmpty(lastname))
                works = works.Where(i => (i.Author.LastName.Contains(lastname)));
            if (!String.IsNullOrEmpty(managerfirstname))
                works = works.Where(i => (i.Manager.FirstName.Contains(managerfirstname)));
            if (!String.IsNullOrEmpty(managerlastname))
                works = works.Where(i => (i.Manager.LastName.Contains(managerlastname)));
            if (!String.IsNullOrEmpty(classname))
                works = works.Where(i => (i.ClassName.Contains(classname)));
            if (userId != null)
                works = works.Where(i => (i.UserId == userId));
            if (authorId != null)
                works = works.Where(i => (i.AuthorId == authorId));
            if (managerId != null)
                works = works.Where(i => (i.ManagerId == managerId));
            if (setId != null)
                works = works.Where(i => (i.SetId == setId));
            if (!String.IsNullOrEmpty(setName))
                works = works.Where(i => (i.Set.Name.Contains(setName)));
            if (year != null)
                works = works.Where(i => (i.Set.Year == year));
            if (state != null)
                works = works.Where(i => (i.State == state));
            int filtered = works.CountAsync().Result;
            works = order switch
            {
                "id" => works.OrderBy(t => t.Id),
                "id_desc" => works.OrderByDescending(t => t.Id),
                "authorfirstname" => works.OrderBy(t => t.Author.FirstName),
                "authorfirstname_desc" => works.OrderByDescending(t => t.Author.FirstName),
                "authorlastname" => works.OrderBy(t => t.Author.LastName),
                "authorlastname_desc" => works.OrderByDescending(t => t.Author.LastName),
                "managerfirstname" => works.OrderBy(t => t.Manager.FirstName),
                "managerfirstname_desc" => works.OrderByDescending(t => t.Manager.FirstName),
                "managerlastname" => works.OrderBy(t => t.Manager.LastName),
                "managerlastname_desc" => works.OrderByDescending(t => t.Manager.LastName),
                "state" => works.OrderBy(t => t.State),
                "state_desc" => works.OrderByDescending(t => t.State),
                "year" => works.OrderBy(t => t.Set.Year),
                "year_desc" => works.OrderByDescending(t => t.Set.Year),
                "classname" => works.OrderBy(t => t.ClassName),
                "classname_desc" => works.OrderByDescending(t => t.ClassName),
                "updated" => works.OrderBy(t => t.Updated),
                "updated_desc" => works.OrderByDescending(t => t.Updated),
                "name" => works.OrderBy(t => t.Name),
                "name_desc" => works.OrderByDescending(t => t.Name),
                _ => works.OrderByDescending(t => t.Updated),
            };
            if (pagesize != 0)
            {
                works = works.Skip(page * pagesize).Take(pagesize);
            }
            List<WorkListVM> worksVM = works.Select(i => new WorkListVM
            {
                Id = i.Id,
                Name = i.Name,
                Description = i.Description,
                Subject = i.Subject,
                Resources = i.Resources,
                AuthorFirstName = i.Author.FirstName,
                AuthorLastName = i.Author.LastName,
                AuthorId = i.AuthorId,
                AuthorEmail = i.Author.Email,
                UserFirstName = i.User.FirstName,
                UserLastName = i.User.LastName,
                UserId = i.UserId,
                UserEmail = i.User.Email,
                ManagerFirstName = i.Manager.FirstName,
                ManagerLastName = i.Manager.LastName,
                ManagerId = i.ManagerId,
                ManagerEmail = i.Manager.Email,
                Updated = i.Updated,
                SetId = i.SetId,
                SetName = i.Set.Name,
                State = i.State,
                ClassName = i.ClassName,
                Year = i.Set.Year
            }).ToList();
            int count = worksVM.Count;
            return Ok(new { total, filtered, count, page, pages = ((pagesize == 0) ? 0 : Math.Ceiling((double)filtered / pagesize)), data = worksVM });
        }

        // GET: Works/5
        /// <summary>
        /// Gets data of one work specified by his Id, returns pure data without goals, contents or user data.
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <returns>Work</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkVM>> GetWork(int id)
        {
            var work = await _context.Works.FindAsync(id);

            if (work == null)
            {
                return NotFound();
            }

            return Ok(new WorkVM
            {
                Id = work.Id,
                Name = work.Name,
                Description = work.Description,
                Subject = work.Subject,
                Resources = work.Resources,
                UserId = work.UserId,
                Updated = work.Updated,
                Created = work.Created,
                ClassName = work.ClassName,
                DetailExpenditures = work.DetailExpenditures,
                MaterialCosts = work.MaterialCosts,
                MaterialCostsProvidedBySchool = work.MaterialCostsProvidedBySchool,
                ServicesCosts = work.ServicesCosts,
                ServicesCostsProvidedBySchool = work.ServicesCostsProvidedBySchool,
                AuthorId = work.AuthorId,
                ManagerId = work.ManagerId,
                RepositoryURL = work.RepositoryURL,
                SetId = work.SetId,
                State = work.State
            }
            );
        }

        [HttpGet("{id}/full")]
        public async Task<ActionResult<WorkVM>> GetFullWork(int id)
        {
            var work = await _context.Works
                .Where(i => i.Id == id)
                .Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.User,
                    i.Author,
                    i.Manager,
                    i.Description,
                    i.Resources,
                    i.Subject,
                    i.Updated,
                    i.Created,
                    i.Goals,
                    i.Outlines,
                    i.State,
                    i.Set,
                    i.ClassName,
                    i.RepositoryURL
                })
                .FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound();
            }

            return Ok(work);
        }

        // POST: Works
        [HttpPost]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<Idea>> Post([FromBody] WorkIM input)
        {
            var userId = Guid.Parse(User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value);
            var author = await _context.Users.FindAsync(input.AuthorId);
            if (author == null)
            {
                return NotFound("User with Id equal to authorId was not found");
            }

            var manager = await _context.Users.FindAsync(input.ManagerId);
            if (manager == null)
            {
                return NotFound("User with Id equal to managerId was not found");
            }

            var set = await _context.Sets.FindAsync(input.SetId);
            if (set == null)
            {
                return NotFound("Set not found");
            }

            if (manager.CanBeEvaluator == false)
            {
                return BadRequest("User with this ManagerId cannot be assigned as manager.");
            }

            if (author.CanBeAuthor == false)
            {
                return BadRequest("User with this AuthorId cannot be assigned as author.");
            }
            var work = new Work
            {
                Name = input.Name,
                Description = input.Description,
                Resources = input.Resources,
                Subject = input.Subject,
                Set = set,
                UserId = userId,
                Created = DateTime.Now,
                Updated = DateTime.Now,
                MaterialCosts = input.MaterialCosts,
                MaterialCostsProvidedBySchool = input.MaterialCostsProvidedBySchool,
                ServicesCosts = input.ServicesCosts,
                ServicesCostsProvidedBySchool = input.ServicesCostsProvidedBySchool,
                State = WorkState.InPreparation,
                DetailExpenditures = input.DetailExpenditures,
                Author = author,
                Manager = manager,
                ClassName = input.ClassName,
                RepositoryURL = input.RepositoryURL
            };
            _context.Works.Add(work);
            await _context.SaveChangesAsync();

            foreach (var setRole in _context.SetRoles.Where(sr => sr.SetId == input.SetId).ToList())
            {
                var workRole = new WorkRole
                {
                    SetRoleId = setRole.Id,
                    WorkId = work.Id,
                    Updated = DateTime.Now,
                };
                _context.WorkRoles.Add(workRole);
            }
            await _context.SaveChangesAsync();

            foreach (var workRole in _context.WorkRoles.Include(wr => wr.SetRole).Include(wr => wr.WorkRoleUsers).Where(wr => wr.WorkId == work.Id).ToList())
            {
                if (workRole.SetRole.Manager == true)
                {
                    workRole.WorkRoleUsers.Add(new WorkRoleUser { User = manager, WorkRole = workRole });
                    await _context.SaveChangesAsync();
                }
            }

            return CreatedAtAction("GetWork", new { id = work.Id }, work);
        }

        // PUT: Works/5
        [HttpPut("{id}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<IActionResult> Put(int id, [FromBody] WorkIM input)
        {
            if (id != input.Id)
            {
                return BadRequest();
            }

            var work = await _context.Works.FindAsync(id);
            _context.Entry(work).State = EntityState.Modified;
            if (work == null)
            {
                return NotFound();
            }

            var user = await _context.Users.FindAsync(input.UserId);
            if (user == null)
            {
                return NotFound("User with Id equal to userId was not found"); // TODO Only owner or Manager or Author in InPreparation State can edit Work
            }

            var author = await _context.Users.FindAsync(input.AuthorId);
            if (author == null)
            {
                return NotFound("User with Id equal to authorId was not found");
            }

            var manager = await _context.Users.FindAsync(input.ManagerId);
            if (manager == null)
            {
                return NotFound("User with Id equal to managerId was not found");
            }

            var set = await _context.Sets.FindAsync(input.SetId);
            if (set == null)
            {
                return NotFound("Set not found");
            }

            if (work.ManagerId != input.ManagerId && manager.CanBeEvaluator == false)
            {
                return BadRequest("User with ManagerId cannot be assigned as manager.");
            }

            if (work.AuthorId != input.AuthorId && author.CanBeAuthor == false)
            {
                return BadRequest("User with AuthorId cannot be assigned as author.");
            }

            work.Name = input.Name;
            work.Description = input.Description;
            work.Resources = input.Resources;
            work.Subject = input.Subject;
            work.Set = set;
            work.MaterialCosts = input.MaterialCosts;
            work.MaterialCostsProvidedBySchool = input.MaterialCostsProvidedBySchool;
            work.ServicesCosts = input.ServicesCosts;
            work.ServicesCostsProvidedBySchool = input.ServicesCostsProvidedBySchool;
            work.State = input.State;
            work.DetailExpenditures = input.DetailExpenditures;
            work.User = user;
            work.Author = author;
            work.Manager = manager;
            work.Updated = DateTime.Now;
            work.ClassName = input.ClassName;
            work.RepositoryURL = input.RepositoryURL;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkExists(id))
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

        // PUT: Works/5/base
        [HttpPut("{id}/base")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<IActionResult> PutBase(int id, [FromBody] WorkBaseIM input)
        {
            if (id != input.Id)
            {
                return BadRequest();
            }

            var work = await _context.Works.FindAsync(id);
            _context.Entry(work).State = EntityState.Modified;
            if (work == null)
            {
                return NotFound();
            }

            var author = await _context.Users.FindAsync(input.AuthorId);
            if (author == null)
            {
                return NotFound("User with Id equal to authorId was not found");
            }

            var manager = await _context.Users.FindAsync(input.ManagerId);
            if (manager == null)
            {
                return NotFound("User with Id equal to managerId was not found");
            }

            var set = await _context.Sets.FindAsync(input.SetId);
            if (set == null)
            {
                return NotFound("Set not found");
            }

            if (work.ManagerId != input.ManagerId && manager.CanBeEvaluator == false)
            {
                return BadRequest("User with this ManagerId cannot be assigned as manager.");
            }

            if (work.AuthorId != input.AuthorId && author.CanBeAuthor == false)
            {
                return BadRequest("User with this AuthorId cannot be assigned as author.");
            }

            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can edit work in this state");
            }

            work.Name = input.Name;
            work.Description = input.Description;
            work.Resources = input.Resources;
            work.Subject = input.Subject;
            work.AuthorId = input.AuthorId;
            work.ManagerId = input.ManagerId;
            work.Set = set;
            work.Updated = DateTime.Now;
            work.ClassName = input.ClassName;
            work.RepositoryURL = input.RepositoryURL;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkExists(id))
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

        // PUT: Works/5/expenditures
        [HttpPut("{id}/expenditures")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<IActionResult> PutExpenditures(int id, [FromBody] WorkExpendituresIM input)
        {
            if (id != input.Id)
            {
                return BadRequest();
            }

            var work = await _context.Works.FindAsync(id);
            _context.Entry(work).State = EntityState.Modified;
            if (work == null)
            {
                return NotFound();
            }

            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can edit work in this state");
            }

            work.MaterialCosts = input.MaterialCosts;
            work.MaterialCostsProvidedBySchool = input.MaterialCostsProvidedBySchool;
            work.ServicesCosts = input.ServicesCosts;
            work.ServicesCostsProvidedBySchool = input.ServicesCostsProvidedBySchool;
            work.DetailExpenditures = input.DetailExpenditures;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkExists(id))
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

        // DELETE: Works/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<Idea>> Delete(int id)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound();
            }

            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can delete work in this state");
            }
            var goals = _context.WorkGoals.Where(ig => ig.Work == work).AsNoTracking().ToList();
            if (goals != null)
            {
                _context.WorkGoals.RemoveRange(goals);
                _context.SaveChanges();
            }
            var outlines = _context.WorkOutlines.Where(ig => ig.Work == work).AsNoTracking().ToList();
            if (outlines != null)
            {
                _context.WorkOutlines.RemoveRange(outlines);
                _context.SaveChanges();
            }
            var roles = _context.WorkRoles.Where(wr => wr.WorkId == work.Id).ToList();
            foreach (WorkRole role in roles)
            {
                var usersAssigned = _context.WorkRoleUsers.Where(wru => wru.WorkRoleId == role.Id).ToList();
                if (usersAssigned != null)
                {
                    _context.WorkRoleUsers.RemoveRange(usersAssigned);
                    _context.SaveChanges();
                }
            }

            work.Updated = DateTime.Now;
            _context.Works.Remove(work);
            await _context.SaveChangesAsync();

            return Ok(work);
        }

        private bool WorkExists(int id)
        {
            return _context.Works.Any(e => e.Id == id);
        }

        // --- goals
        // GET: Works/5/goals
        /// <summary>
        /// Fetch list of all goals for this work
        /// </summary>
        /// <param name="id">Work id</param>
        /// <returns>Array of goals ordered by value in Order field, HTTP 404</returns>
        [HttpGet("{id}/goals")]
        public async Task<ActionResult<IEnumerable<WorkGoal>>> GetWorkGoals(int id)
        {
            var work = await _context.Works.FindAsync(id);

            if (work == null)
            {
                return NotFound("work not found");
            }

            var goals = _context.WorkGoals
                .Where(wg => wg.Work == work)
                .Select(wg => new { wg.WorkId, wg.Order, wg.Text })
                .OrderBy(wg => wg.Order)
                .AsNoTracking();
            return Ok(goals);
        }

        // GET: Works/5/goals/1
        /// <summary>
        /// Fetch specific goal of an work in certain order
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="order">Order (1+)</param>
        /// <returns>Goal, HTTP 404</returns>
        [HttpGet("{id}/goals/{order}")]
        public async Task<ActionResult<WorkGoal>> GetWorkGoal(int id, int order)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }

            var goal = _context.WorkGoals
                .Where(wg => wg.Work == work && wg.Order == order)
                .Select(wg => new { wg.WorkId, wg.Order, wg.Text })
                .FirstOrDefault();
            if (goal == null)
            {
                return NotFound("goal not found");
            }
            return Ok(goal);
        }

        // POST: Works/5/goals
        /// <summary>
        /// Creates and stores a new goal for a work
        /// </summary>
        /// <param name="id">Work id</param>
        /// <param name="goalText">Object containing text</param>
        /// <returns>New goal, HTTP 404</returns>
        [HttpPost("{id}/goals")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkGoal>> PostWorkGoals(int id, [FromBody] WorkGoalIM goalText)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }

            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }

            if (String.IsNullOrEmpty(goalText.Text))
            {
                return BadRequest("text of goal cannot be empty");
            }
            int maxGoalOrder;
            try
            {
                maxGoalOrder = _context.WorkGoals.Where(wg => wg.WorkId == id).Max(wg => wg.Order);
            }
            catch
            {
                maxGoalOrder = 0;
            }
            var newGoal = new WorkGoal { WorkId = id, Order = maxGoalOrder + 1, Text = goalText.Text };
            _context.WorkGoals.Add(newGoal);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetWorkGoal", new { id = newGoal.WorkId, order = newGoal.Order }, new { WorkId = id, Order = maxGoalOrder + 1, goalText.Text });
        }

        [HttpPost("{id}/goals/all")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkGoal>> PostWorkGoalsAll(int id, [FromBody] List<string> goals)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }

            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            for (int i = 0; i < goals.Count; i++)
            {
                if (!String.IsNullOrEmpty(goals[i]))
                {
                    var newGoal = new WorkGoal { WorkId = id, Order = i + 1, Text = goals[i] };
                    _context.WorkGoals.Add(newGoal);
                    await _context.SaveChangesAsync();
                }
            }
            return Ok();
        }

        // PUT: Works/5/goals
        /// <summary>
        /// Replaces all goals inside a work with a new ones
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="goalText">New collection of goals</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/goals")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<List<IdeaGoal>>> PutWorkGoals(int id, [FromBody] List<WorkGoalIM> newGoalTexts)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }

            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }

            var goals = _context.WorkGoals.Where(wg => wg.Work == work).AsNoTracking().ToList();
            if (goals != null)
            {
                _context.WorkGoals.RemoveRange(goals);
                work.Updated = DateTime.Now;
                _context.SaveChanges();
            }

            int i = 1;
            foreach (WorkGoalIM goal in newGoalTexts)
            {
                if (!String.IsNullOrEmpty(goal.Text))
                {
                    var newGoal = new WorkGoal { WorkId = id, Order = i++, Text = goal.Text };
                    _context.WorkGoals.Add(newGoal);
                }
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: Works/5/goals/1
        /// <summary>
        /// Changes text of goal inside a work
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="order">Order of goal</param>
        /// <param name="goalText">New text of goal</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/goals/{order}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkGoal>> PutWorkGoalsOfOrder(int id, int order, [FromBody] WorkGoalIM goalText)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            if (String.IsNullOrEmpty(goalText.Text))
            {
                return BadRequest("text of goal cannot be empty");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            var goal = _context.WorkGoals.Where(wg => wg.Work == work && wg.Order == order).FirstOrDefault();
            if (goal == null)
            {
                return NotFound("goal not found");
            }

            work.Updated = DateTime.Now;
            goal.Text = goalText.Text;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: Works/5/goals/1/moveto/2
        /// <summary>
        /// Moves goal to a new position and shifts other goals to reorganize them in new order
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="order">Original position</param>
        /// <param name="newOrder">New position</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/goals/{order}/moveto/{newOrder}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkGoal>> PutWorkGoalsMove(int id, int order, int newOrder)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var goal = _context.WorkGoals.Where(wg => wg.Work == work && wg.Order == order).FirstOrDefault();
            if (goal == null)
            {
                return NotFound("goal not found");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }

            int maxOrder;
            try
            {
                maxOrder = _context.WorkGoals.Where(wg => wg.WorkId == id).Max(wg => wg.Order);
            }
            catch
            {
                maxOrder = 0;
            }

            if (newOrder > maxOrder) newOrder = maxOrder;

            WorkGoal temp = new() { WorkId = id, Order = newOrder, Text = goal.Text }; // future record
            _context.WorkGoals.Remove(goal); // remove old record, we made backup of it in temp
            _context.SaveChanges();

            if (order > newOrder) // moving down
            {
                for (int i = order - 1; i >= newOrder; i--)
                {
                    var item = _context.WorkGoals.Where(wg => wg.Work == work && wg.Order == i).FirstOrDefault();
                    if (item != null) item.Order += 1;
                    _context.SaveChanges();
                }
            }
            else if (order < newOrder) // moving up
            {
                for (int i = order + 1; i <= newOrder; i++)
                {
                    var item = _context.WorkGoals.Where(wg => wg.Work == work && wg.Order == i).FirstOrDefault();
                    if (item != null) item.Order -= 1;
                    _context.SaveChanges();
                }
            }
            _context.WorkGoals.Add(temp);
            work.Updated = DateTime.Now;
            _context.SaveChanges();
            return NoContent();
        }

        // DELETE: Works/5/goals
        /// <summary>
        /// Removes all goals in specified work
        /// </summary>
        /// <param name="id">Work id</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpDelete("{id}/goals")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<IdeaGoal>> DeleteAllWorkGoals(int id)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            var goals = _context.WorkGoals.Where(ig => ig.Work == work).AsNoTracking().ToList();
            if (goals != null)
            {
                _context.WorkGoals.RemoveRange(goals);
                work.Updated = DateTime.Now;
                _context.SaveChanges();
            }
            return NoContent();
        }

        // DELETE: Works/5/goals/1
        /// <summary>
        /// Removes selected goal and shift all others to fill a hole
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="order">Order of removed goal</param>
        /// <returns>Removed goal, HTTP 404</returns>
        [HttpDelete("{id}/goals/{order}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkGoal>> DeleteWorkGoal(int id, int order)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            var goal = _context.WorkGoals.Where(ig => ig.Work == work && ig.Order == order).AsNoTracking().FirstOrDefault();
            if (goal == null)
            {
                return NotFound("goal not found");
            }

            WorkGoal removedGoal = new() { Id = goal.Id, WorkId = id, Order = order, Text = goal.Text };
            int maxGoalOrder;
            try
            {
                maxGoalOrder = _context.WorkGoals.Where(ig => ig.WorkId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxGoalOrder = 0;
            }

            _context.WorkGoals.Remove(goal);
            work.Updated = DateTime.Now;
            _context.SaveChanges();

            for (int i = order; i <= maxGoalOrder; i++)
            {
                var row = _context.WorkGoals.Where(ig => ig.WorkId == id && ig.Order == i).FirstOrDefault();
                if (row != null)
                {
                    row.Order = i - 1;
                    _context.SaveChanges();
                }
            }

            return Ok(new { removedGoal.Id, removedGoal.WorkId, removedGoal.Order, removedGoal.Text });
        }

        // --- outlines
        // GET: Works/5/outlines
        /// <summary>
        /// Fetch list of all outlines for this work
        /// </summary>
        /// <param name="id">Work id</param>
        /// <returns>Array of items ordered by value in Order field, HTTP 404</returns>
        [HttpGet("{id}/outlines")]
        public async Task<ActionResult<IEnumerable<WorkOutline>>> GetWorkOutlines(int id)
        {
            var work = await _context.Works.FindAsync(id);

            if (work == null)
            {
                return NotFound("work not found");
            }

            var contents = _context.WorkOutlines
                .Where(wc => wc.Work == work)
                .Select(wc => new { wc.WorkId, wc.Order, wc.Text })
                .OrderBy(ic => ic.Order)
                .AsNoTracking();
            return Ok(contents);
        }

        // GET: Works/5/outlines/1
        /// <summary>
        /// Fetch specific outline of a work in certain order
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="order">Order (1+)</param>
        /// <returns>Content, HTTP 404</returns>
        [HttpGet("{id}/outlines/{order}")]
        public async Task<ActionResult<WorkOutline>> GetWorkOutline(int id, int order)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }

            var content = _context.WorkOutlines
                .Where(wg => wg.Work == work && wg.Order == order)
                .Select(wg => new { wg.WorkId, wg.Order, wg.Text })
                .FirstOrDefault();
            if (content == null)
            {
                return NotFound("outline not found");
            }
            return Ok(content);
        }

        // POST: Works/5/outlines
        /// <summary>
        /// Creates and stores a new outline item for a work
        /// </summary>
        /// <param name="id">Work id</param>
        /// <param name="goalText">Object containing text</param>
        /// <returns>New goal, HTTP 404</returns>
        [HttpPost("{id}/outlines")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkGoal>> PostWorkOutlines(int id, [FromBody] WorkOutlineIM outlineText)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            if (String.IsNullOrEmpty(outlineText.Text))
            {
                return BadRequest("text of outline cannot be empty");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            int maxOrder;
            try
            {
                maxOrder = _context.WorkOutlines.Where(wo => wo.WorkId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxOrder = 0;
            }
            var newOutline = new WorkOutline { WorkId = id, Order = maxOrder + 1, Text = outlineText.Text };
            _context.WorkOutlines.Add(newOutline);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetWorkOutline", new { id = newOutline.WorkId, order = newOutline.Order }, new { WorkId = id, Order = maxOrder + 1, outlineText.Text });
        }

        [HttpPost("{id}/outlines/all")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult> PostWorkOutlinesAll(int id, [FromBody] List<string> outlines)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }

            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            for (int i = 0; i < outlines.Count; i++)
            {
                if (!String.IsNullOrEmpty(outlines[i]))
                {
                    var newOutline = new WorkOutline { WorkId = id, Order = i + 1, Text = outlines[i] };
                    _context.WorkOutlines.Add(newOutline);
                    await _context.SaveChangesAsync();
                }
            }
            return Ok();
        }

        // PUT: Works/5/outlines
        /// <summary>
        /// Replaces all outlines inside a work with a new ones
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="goalText">New collection of outlines</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/outlines")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<List<IdeaGoal>>> PutWorkOutlines(int id, [FromBody] List<WorkOutlineIM> newOutlineTexts)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            var outlines = _context.WorkOutlines.Where(wo => wo.Work == work).AsNoTracking().ToList();
            if (outlines != null)
            {
                _context.WorkOutlines.RemoveRange(outlines);
                work.Updated = DateTime.Now;
                _context.SaveChanges();
            }

            int i = 1;
            foreach (WorkOutlineIM outline in newOutlineTexts)
            {
                if (!String.IsNullOrEmpty(outline.Text))
                {
                    var newOutline = new WorkGoal { WorkId = id, Order = i++, Text = outline.Text };
                    _context.WorkGoals.Add(newOutline);
                }
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: Works/5/outlines/1
        /// <summary>
        /// Changes text of outline inside a work
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="order">Order of outline</param>
        /// <param name="goalText">New text of outline</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/outlines/{order}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkOutline>> PutWorkOutlineOfOrder(int id, int order, [FromBody] WorkOutlineIM outlineText)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            if (String.IsNullOrEmpty(outlineText.Text))
            {
                return BadRequest("text of outline cannot be empty");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            var outline = _context.WorkOutlines.Where(wo => wo.Work == work && wo.Order == order).FirstOrDefault();
            if (outline == null)
            {
                return NotFound("outline not found");
            }

            work.Updated = DateTime.Now;
            outline.Text = outlineText.Text;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: Works/5/outlines/1/moveto/2
        /// <summary>
        /// Moves outline to a new position and shifts other outline points to reorganize them in new order
        /// </summary>
        /// <param name="id">Work Id</param>
        /// <param name="order">Original position</param>
        /// <param name="newOrder">New position</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/outlines/{order}/moveto/{newOrder}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkGoal>> PutWorkOutlinesMove(int id, int order, int newOrder)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var outline = _context.WorkOutlines.Where(wg => wg.Work == work && wg.Order == order).FirstOrDefault();
            if (outline == null)
            {
                return NotFound("outline not found");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }

            int maxOrder;
            try
            {
                maxOrder = _context.WorkOutlines.Where(wg => wg.WorkId == id).Max(wg => wg.Order);
            }
            catch
            {
                maxOrder = 0;
            }

            if (newOrder > maxOrder) newOrder = maxOrder;

            WorkOutline temp = new() { WorkId = id, Order = newOrder, Text = outline.Text }; // future record
            _context.WorkOutlines.Remove(outline); // remove old record, we backup it in temp
            _context.SaveChanges();

            if (order > newOrder) // moving down
            {
                for (int i = order - 1; i >= newOrder; i--)
                {
                    var item = _context.WorkOutlines.Where(wg => wg.Work == work && wg.Order == i).FirstOrDefault();
                    if (item != null) item.Order += 1;
                    _context.SaveChanges();
                }
            }
            else if (order < newOrder) // moving up
            {
                for (int i = order + 1; i <= newOrder; i++)
                {
                    var item = _context.WorkOutlines.Where(wg => wg.Work == work && wg.Order == i).FirstOrDefault();
                    if (item != null) item.Order -= 1;
                    _context.SaveChanges();
                }
            }
            _context.WorkOutlines.Add(temp);
            work.Updated = DateTime.Now;
            _context.SaveChanges();
            return NoContent();
        }

        // DELETE: Works/5/outlines
        /// <summary>
        /// Removes all outlines in specified work
        /// </summary>
        /// <param name="id">Idea id</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpDelete("{id}/outlines")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkGoal>> DeleteAllWorkOulines(int id)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var outlines = _context.WorkOutlines.Where(wg => wg.Work == work).AsNoTracking().ToList();
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }
            if (outlines != null)
            {
                _context.WorkOutlines.RemoveRange(outlines);
                work.Updated = DateTime.Now;
                _context.SaveChanges();
            }
            return NoContent();
        }

        // DELETE: Ideas/5/outlines/1
        /// <summary>
        /// Removes selected outline and shift all others to fill hole
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="order">Order of removed goal</param>
        /// <returns>Removed goal, HTTP 404</returns>
        [HttpDelete("{id}/outlines/{order}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<IdeaGoal>> DeleteWorkOutline(int id, int order)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var outline = _context.WorkOutlines.Where(wg => wg.Work == work && wg.Order == order).AsNoTracking().FirstOrDefault();
            if (outline == null)
            {
                return NotFound("outline not found");
            }
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (work.State != WorkState.InPreparation && !isAdministrator.Succeeded)
            {
                return BadRequest("Only admin can modify work in this state");
            }

            WorkOutline removedOutline = new() { Id = outline.Id, WorkId = id, Order = order, Text = outline.Text };
            int maxOrder;
            try
            {
                maxOrder = _context.WorkOutlines.Where(wg => wg.WorkId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxOrder = 0;
            }

            _context.WorkOutlines.Remove(outline);
            work.Updated = DateTime.Now;
            _context.SaveChanges();

            for (int i = order; i <= maxOrder; i++)
            {
                var row = _context.WorkOutlines.Where(wg => wg.WorkId == id && wg.Order == i).FirstOrDefault();
                if (row != null)
                {
                    row.Order = i - 1;
                    _context.SaveChanges();
                }
            }
            return Ok(new { removedOutline.Id, removedOutline.WorkId, removedOutline.Order, removedOutline.Text });
        }

        // --- state
        [HttpGet("{id}/state")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkStateDescriptionVM>> GetWorkState(int id)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound();
            }
            return new WorkStateDescriptionVM { Code = work.State, Description = work.State.ToString() };
        }

        [HttpGet("{id}/nextstates")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<List<WorkStateDescriptionVM>>> GetWorkNextStates(int id)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var transitions = _stateTransitions[work.State];
            return transitions.Select(v => new WorkStateDescriptionVM { Code = v, Description = v.ToString() }).ToList();
        }

        [HttpGet("allstates")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public ActionResult<List<WorkStateDescriptionVM>> GetWorkAllStates()
        {
            return Enum.GetValues(typeof(WorkState)).Cast<WorkState>().Select(v => new WorkStateDescriptionVM { Code = v, Description = v.ToString() }).ToList();
        }

        [HttpPut("{id}/state/{newState}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkState>> PutWorkState(int id, WorkState newState)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var next = _stateTransitions[work.State];
            //  || (User.HasClaim(c => ((c.Type == Security.THESES_ADMIN_CLAIM) && (c.Value == "1")))) || (User.HasClaim(c => ((c.Type == Security.THESES_ROBOT_CLAIM) && (c.Value == "1"))))
            if (!next.Contains(newState))
            {
                return BadRequest("state transition is not valid");
            }
            work.State = newState;
            _context.SaveChanges();
            return newState;
        }

        // --- roles
        [HttpGet("{id}/roles")]
        public async Task<ActionResult<List<WorkRole>>> GetWorkRoles(int id)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var roles = _context.WorkRoles.Include(wr => wr.SetRole).Where(wr => wr.WorkId == work.Id).ToList();
            return roles;
        }

        [HttpGet("{id}/roles/{workRoleId}")]
        public async Task<ActionResult<WorkRole>> GetWorkRole(int id, int workRoleId)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var role = _context.WorkRoles.Include(wr => wr.SetRole).Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            return role;
        }

        [HttpPost("{id}/roles")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult> PostWorkRoles(int id, [FromBody] WorkRole workRole)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var set = await _context.Sets.FindAsync(workRole.SetRoleId);
            if (set == null)
            {
                return NotFound("set not found");
            }
            if (work.SetId != set.Id)
            {
                return BadRequest("set referenced by work and new role does not match");
            }
            workRole.Updated = DateTime.Now;
            _context.WorkRoles.Add(workRole);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetWorkRole", new { id = workRole.WorkId }, workRole);
        }

        [HttpDelete("{id}/roles/{roleId}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkRole>> DeleteWorkRole(int id, int roleId)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var workRole = await _context.WorkRoles.FindAsync(roleId);
            if (workRole == null)
            {
                return NotFound("workRole not found");
            }
            if (workRole.WorkId != work.Id)
            {
                return BadRequest("work does not contain specified role");
            }
            _context.WorkRoles.Remove(workRole);
            work.Updated = DateTime.Now;
            _context.SaveChanges();
            return Ok(workRole);
        }

        // users in roles
        [HttpGet("{id}/roles/{workRoleId}/users")]
        public async Task<ActionResult<List<User>>> GetWorkRoleAssignments(int id, int workRoleId)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var role = _context.WorkRoles.Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            if (role == null)
            {
                return NotFound("role not found in this work");
            }
            var assigned = _context.WorkRoleUsers.Include(wru => wru.User).Where(wru => wru.WorkRoleId == workRoleId).Select(wru => wru.User).ToList();
            return assigned;
        }

        [HttpPost("{id}/roles/{workRoleId}/users")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult> PostWorkRoleAssignments(int id, int workRoleId, [FromBody] RoleUserIM input)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var workRole = await _context.WorkRoles.FindAsync(workRoleId);
            if (workRole == null)
            {
                return NotFound("workRole not found");
            }
            if (workRole.WorkId != work.Id)
            {
                return BadRequest("work does not contain specified role");
            }
            var user = await _context.Users.FindAsync(Guid.Parse(input.Id));
            if (user == null)
            {
                return NotFound("user not found");
            }
            WorkRoleUser roleUser = _context.WorkRoleUsers.Where(wru => wru.WorkRoleId == workRoleId && wru.UserId == user.Id).FirstOrDefault();
            if (roleUser != null)
            {
                return Ok("user was already assigned to this role");
            }

            WorkRoleUser nwru = new() { WorkRole = workRole, User = user };
            _context.WorkRoleUsers.Add(nwru);
            await _context.SaveChangesAsync();
            return Ok(nwru);
        }

        [HttpDelete("{id}/roles/{roleId}/users/{userId}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkRole>> DeleteWorkRoleUser(int id, int roleId, string userId)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var workRole = await _context.WorkRoles.FindAsync(roleId);
            if (workRole == null)
            {
                return NotFound("workRole not found");
            }
            if (workRole.WorkId != work.Id)
            {
                return BadRequest("work does not contain specified role");
            }
            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user == null)
            {
                return NotFound("user not found");
            }
            WorkRoleUser roleUser = _context.WorkRoleUsers.Where(wru => wru.WorkRoleId == roleId && wru.UserId == user.Id).FirstOrDefault();
            if (roleUser == null)
            {
                return NotFound("user is not assigned to this role in this work");
            }
            _context.WorkRoleUsers.Remove(roleUser);
            _context.SaveChanges();
            return Ok(workRole);
        }

        // print version
        [HttpGet("{id}/application")]
        [Authorize]
        public async Task<ActionResult> DownloadApplication(int id)
        {
            var work = await _context.Works.Include(w => w.Author).Where(w => w.Id == id).FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound("work not found");
            }
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, work.AuthorId.ToString())
                && !User.HasClaim(ClaimTypes.NameIdentifier, work.ManagerId.ToString())
                && !isEvaluator.Succeeded)
            {
                return BadRequest("You are not allowed do download application for this work");
            }
            if (work.State == WorkState.InPreparation)
            {
                return BadRequest("unable to render application for work in preparation state");
            }
            var set = await _context.Sets.Where(s => s.Id == work.SetId).FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound("set not found");
            }
            var roles = _context.WorkRoles.Include(wr => wr.SetRole)
                .Where(wr => wr.WorkId == id && wr.SetRole.PrintedInApplication == true)
                .Include(wr => wr.WorkRoleUsers).ThenInclude(wru => wru.User)
                .ToList();
            var goals = _context.WorkGoals.Where(wg => wg.WorkId == id).ToList();
            var outlines = _context.WorkOutlines.Where(wo => wo.WorkId == id).ToList();

            string templateFileName = "";
            string outputFileName = "";
            bool signDepartmentHead = true;
            bool signClassTeacher = true;
            bool signGarant = true;
            bool signDirector = true;
            bool signConsultant = true;
            switch (set.Template)
            {
                case ApplicationTemplate.SeminarWork:
                    {
                        templateFileName = "/Prints/Pages/AssignmentSeminar.cshtml";
                        outputFileName = "RP" + set.Year + "_";
                        signDirector = false;
                        signDepartmentHead = false;
                        break;
                    }
                case ApplicationTemplate.GraduationWorkHigher:
                    {
                        templateFileName = "/Prints/Pages/AssignmentGraduationHigher.cshtml";
                        outputFileName = "AP" + set.Year + "_";
                        break;
                    }
                default:
                    {
                        templateFileName = "/Prints/Pages/AssignmentGraduation.cshtml";
                        outputFileName = "MP" + set.Year + "_";
                        break;
                    }
            }
            outputFileName += work.Name;
            string documentBody = await _razorRenderer.RenderViewToStringAsync(templateFileName, new AssignmentVM
            {
                AuthorName = work.Author.Name,
                ClassName = work.ClassName,
                Title = work.Name,
                Subject = work.Subject,
                Description = work.Description,
                Resources = work.Resources,
                MaterialCosts = work.MaterialCosts,
                MaterialCostsProvidedBySchool = work.MaterialCostsProvidedBySchool,
                ServicesCosts = work.ServicesCosts,
                ServicesCostsProvidedBySchool = work.ServicesCostsProvidedBySchool,
                SetName = set.Name,
                AppUrl = HtmlEncoder.Default.Encode(Request.Scheme + "://" + Request.Host.Value),
                Date = DateTime.Now,
                Roles = roles,
                Goals = goals,
                Outlines = outlines,
                HasClassTeacherSignature = signClassTeacher,
                HasDepartmentHeadSignature = signDepartmentHead,
                HasGarantSignature = signGarant,
                HasDirectorSignature = signDirector,
                HasConsultantSignature = signConsultant
            });
            MemoryStream memory = new(Encoding.UTF8.GetBytes(documentBody));
            return File(memory, "text/html", outputFileName + ".html");
        }
    }
}
