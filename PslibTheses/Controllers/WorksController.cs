﻿using Microsoft.AspNetCore.Authorization;
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
        private readonly WorkState[] editableStates = new WorkState[] { WorkState.InPreparation, WorkState.WorkedOut, WorkState.Delivered};

        public WorksController(ThesesContext context, RazorViewToStringRenderer razorRenderer, IConfiguration configuration, /*EmailSender emailSender,*/ IAuthorizationService authorizationService)
        {
            _context = context;
            _razorRenderer = razorRenderer;
            _configuration = configuration;
            //_emailSender = emailSender;
            _authorizationService = authorizationService;
        }
        // GET: Work
        [Authorize]
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
            string evaluatorId = null,
            WorkState? state = null,
            string order = "name",
            int page = 0,
            int pagesize = 0)
        {
            IQueryable<Work> works = _context.Works
                .Include(i => i.Author)
                .Include(i => i.Manager)
                .Include(i => i.Set)
                .Include(i => i.Roles)
                .ThenInclude(r => r.WorkRoleUsers)
                .ThenInclude(wru => wru.User)
                ;
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
            if (evaluatorId != null)
            {
                var guid = Guid.Parse(evaluatorId);
                works = works.Where(w => w.Roles.Any(wr => wr.WorkRoleUsers.Any(wru => wru.UserId == guid)));
            }
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
                Year = i.Set.Year,
                Roles = i.Roles
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
        [Authorize]
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
        [Authorize]
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

            if (!editableStates.Contains(work.State))
            {
                return BadRequest("work is not in editable state");
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

            if (!editableStates.Contains(work.State))
            {
                return BadRequest("work is not in editable state");
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
            var isAdministrator = await _authorizationService.AuthorizeAsync(User, "Manager");
            if (!isAdministrator.Succeeded)
            {
                if (!next.Contains(newState))
                {
                    return BadRequest("state transition is not valid");
                }
                if (newState == WorkState.Evaluated)
                {
                    await _context.Entry(work).Collection(w => w.Roles).LoadAsync();
                    bool allFinalized = true;
                    foreach (var role in work.Roles)
                    {
                        if (role.Finalized == false)
                        {
                            allFinalized = false;
                        }
                    }
                    if (!allFinalized) return BadRequest("unfinalized role");
                }
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
            List<WorkRole> roles;
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!isEvaluator.Succeeded && work.State < WorkState.Evaluated)
            {
                roles = _context.WorkRoles.Include(wr => wr.SetRole).Include(wr => wr.WorkRoleUsers).Where(wr => wr.WorkId == work.Id).AsNoTracking().ToList();
                foreach (var role in roles)
                {
                    role.MarkValue = 0;
                    role.MarkText = "?";
                    role.Mark = "?";
                }
            }
            else
            {
                roles = _context.WorkRoles.Include(wr => wr.SetRole).Include(wr => wr.WorkRoleUsers).Where(wr => wr.WorkId == work.Id).ToList();
            }           
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
            var role = _context.WorkRoles
                .Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            _context.Entry(role).Reference(wr => wr.SetRole).Load();
            _context.Entry(role).Collection(wr => wr.WorkRoleUsers).Load();
            if (role == null)
            {
                return NotFound("role not found");
            }
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!isEvaluator.Succeeded && !User.HasClaim(ClaimTypes.NameIdentifier, work.AuthorId.ToString()) && work.State < WorkState.Evaluated)
            {
                role.Mark = null;
                role.Review = null;
            }
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
        [Authorize(Policy = "Administrator")]
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
        [Authorize]
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

        // review for role
        [Authorize]
        [HttpGet("{id}/roles/{workRoleId}/review")]
        public async Task<ActionResult<WorkRoleReviewVM>> GetWorkRoleReview(int id, int workRoleId)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var role = _context.WorkRoles
                .Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            if (role == null)
            {
                return NotFound("role not found");
            }
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!isEvaluator.Succeeded && !User.HasClaim(ClaimTypes.NameIdentifier, work.AuthorId.ToString()) && work.State < WorkState.Evaluated)
            {
                return Ok(new WorkRoleReviewVM { 
                    WorkId = id,
                    SetRoleId = role.SetRoleId,
                    WorkRoleId = workRoleId,
                    MarkText = null,
                    MarkValue = null,
                    Finalized = role.Finalized,
                    Review = null,
                    Updated = role.Updated
                });
            }
            else
            {
                return Ok(new WorkRoleReviewVM
                {
                    WorkId = id,
                    SetRoleId = role.SetRoleId,
                    WorkRoleId = workRoleId,
                    MarkText = role.MarkText,
                    MarkValue = role.MarkValue,
                    Finalized = role.Finalized,
                    Review = role.Review,
                    Updated = role.Updated
                });
            }
        }

        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        [HttpPut("{id}/roles/{workRoleId}/review")]
        public async Task<ActionResult> PutWorkRoleReview(int id, int workRoleId, [FromBody] WorkRoleReviewIM input)
        {
            if (id != input.WorkId)
            {
                return BadRequest("inconsistent work data");
            }
            if (workRoleId != input.WorkRoleId)
            {
                return BadRequest("inconsistent workRole data");
            }
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var role = _context.WorkRoles
                .Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            if (role == null)
            {
                return NotFound("role not found");
            }
            _context.Entry(role).Reference(wr => wr.SetRole).Load();
            _context.Entry(role).Collection(wr => wr.WorkRoleUsers).Load();
            ICollection<string> evaluators = role.WorkRoleUsers.Select(wru => wru.UserId.ToString()).ToArray();
            var userId = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (!evaluators.Contains(userId) && !isAdmin.Succeeded)
            {
                return Unauthorized("user is not administrator nor evaluator in this role");
            }
            if (work.State != WorkState.Delivered)
            {
                return BadRequest("work is not in state suitable for writing reviews");
            }
            role.Review = input.Review;
            role.Updated = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok(role);
        }

        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        [HttpPut("{id}/roles/{workRoleId}/mark")]
        public async Task<ActionResult> PutWorkRoleMark(int id, int workRoleId, [FromBody] WorkRoleMarkIM input)
        {
            if (id != input.WorkId)
            {
                return BadRequest("inconsistent work data");
            }
            if (workRoleId != input.WorkRoleId)
            {
                return BadRequest("inconsistent workRole data");
            }
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var role = _context.WorkRoles
                .Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            if (role == null)
            {
                return NotFound("role not found");
            }
            _context.Entry(role).Reference(wr => wr.SetRole).Load();
            _context.Entry(role).Collection(wr => wr.WorkRoleUsers).Load();
            ICollection<string> evaluators = role.WorkRoleUsers.Select(wru => wru.UserId.ToString()).ToArray();
            var userId = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (!evaluators.Contains(userId) && !isAdmin.Succeeded)
            {
                return Unauthorized("user is not administrator nor evaluator in this role");
            }
            if (work.State != WorkState.Delivered)
            {
                return BadRequest("work is not in state suitable for writing reviews");
            }
            role.MarkText = input.MarkText;
            role.MarkValue = input.MarkValue;
            role.Finalized = input.Finalized;
            role.Updated = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok(role);
        }

        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        [HttpPut("{id}/roles/{workRoleId}/finalized/{value}")]
        public async Task<ActionResult> PutWorkRoleFinalized(int id, int workRoleId, bool value)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var role = _context.WorkRoles
                .Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            if (role == null)
            {
                return NotFound("role not found");
            }
            _context.Entry(role).Reference(wr => wr.SetRole).Load();
            _context.Entry(role).Collection(wr => wr.WorkRoleUsers).Load();
            ICollection<string> evaluators = role.WorkRoleUsers.Select(wru => wru.UserId.ToString()).ToArray();
            var userId = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (!evaluators.Contains(userId) && !isAdmin.Succeeded)
            {
                return Unauthorized("user is not administrator nor evaluator in this role");
            }
            if (work.State != WorkState.Delivered)
            {
                return BadRequest("work is not in state suitable for writing reviews");
            }
            role.Finalized = value;
            await _context.SaveChangesAsync();
            return Ok(role);
        }

        // review questions
        [Authorize]
        [HttpGet("{workId}/roles/{workRoleId}/reviewQuestions")]
        public async Task<ActionResult<List<WorkRoleQuestion>>> GetWorkRoleReviewQuestions(int workId, int workRoleId)
        {
            var work = await _context.Works.FindAsync(workId);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var role = _context.WorkRoles
                .Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            if (role == null)
            {
                return NotFound("role not found");
            }
            var questions = await _context.WorkRoleQuestions.Where(wrq => wrq.WorkRoleId == workRoleId).ToListAsync();
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!isEvaluator.Succeeded && !User.HasClaim(ClaimTypes.NameIdentifier, work.AuthorId.ToString()) && work.State < WorkState.Evaluated)
            {
                return Ok();
            }
            else
            {
                return Ok(questions);
            }
        }

        [Authorize]
        [HttpGet("{workId}/roles/{workRoleId}/reviewQuestions/{id}")]
        public async Task<ActionResult<List<WorkRoleQuestion>>> GetWorkRoleReviewQuestion(int id)
        {
            var question = await _context.WorkRoleQuestions.FindAsync(id);
            if (question == null)
            {
                return NotFound("question not found");
            }
            _context.Entry(question).Reference(q => q.WorkRole).Load();
            _context.Entry(question).Reference(q => q.WorkRole.Work).Load();
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!isEvaluator.Succeeded && !User.HasClaim(ClaimTypes.NameIdentifier, question.WorkRole.Work.AuthorId.ToString()) && question.WorkRole.Work.State < WorkState.Evaluated)
            {
                return Ok();
            }
            else
            {
                return Ok(question);
            }
        }

        [HttpPost("{workId}/roles/{workRoleId}/reviewQuestions")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkRoleQuestion>> PostWorkRoleReviewQuestion(int workId, int workRoleId, [FromBody] TextIM input)
        {
            var work = await _context.Works.FindAsync(workId);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var role = _context.WorkRoles
                .Where(wr => (wr.WorkId == work.Id && wr.Id == workRoleId)).FirstOrDefault();
            if (role == null)
            {
                return NotFound("role not found");
            }
            _context.Entry(role).Collection(r => r.WorkRoleUsers).Load();
            ICollection<string> evaluators = role.WorkRoleUsers.Select(wru => wru.UserId.ToString()).ToArray();
            var userId = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (!evaluators.Contains(userId) && !isAdmin.Succeeded)
            {
                return Unauthorized("user is nor administrator nor evaluator in this role");
            }
            WorkRoleQuestion nwrq = new WorkRoleQuestion { WorkRoleId = workRoleId, Created = DateTime.Now, CreatedById = Guid.Parse(userId), Text = input.Text};
            _context.WorkRoleQuestions.Add(nwrq);
            await _context.SaveChangesAsync();
            return Ok(nwrq);
        }

        [HttpPut("{workId}/roles/{workRoleId}/reviewQuestions/{id}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkRoleQuestion>> PutWorkRoleReviewQuestion(int id, [FromBody] TextIM input)
        {
            var question = await _context.WorkRoleQuestions.FindAsync(id);
            if (question == null)
            {
                return NotFound("question not found");
            }
            _context.Entry(question).Reference(q => q.WorkRole).Load();
            _context.Entry(question.WorkRole).Reference(wr => wr.Work).Load();
            _context.Entry(question.WorkRole).Collection(wr => wr.WorkRoleUsers).Load();

            var userId = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            ICollection<string> evaluators = question.WorkRole.WorkRoleUsers.Select(wru => wru.UserId.ToString()).ToArray();
            if (!evaluators.Contains(userId) && !isAdmin.Succeeded)
            {
                return Unauthorized("user is nor administrator nor evaluator in this role");
            }
            question.Text = input.Text;
            await _context.SaveChangesAsync();
            return Ok(question);
        }

        [HttpDelete("{workId}/roles/{workRoleId}/reviewQuestions/{id}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<WorkRoleQuestion>> DeleteWorkRoleReviewQuestion(int id)
        {
            var question = await _context.WorkRoleQuestions.FindAsync(id);
            if (question == null)
            {
                return NotFound("question not found");
            }
            _context.Entry(question).Reference(q => q.WorkRole).Load();
            _context.Entry(question.WorkRole).Reference(wr => wr.Work).Load();
            _context.Entry(question.WorkRole).Collection(wr => wr.WorkRoleUsers).Load();

            var userId = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            ICollection<string> evaluators = question.WorkRole.WorkRoleUsers.Select(wru => wru.UserId.ToString()).ToArray();
            if (!evaluators.Contains(userId) && !isAdmin.Succeeded)
            {
                return Unauthorized("user is nor administrator nor evaluator in this role");
            }
            _context.WorkRoleQuestions.Remove(question);
            await _context.SaveChangesAsync();
            return Ok(question);
        }

        // statistics for role in term
        [Authorize]
        [HttpGet("{id}/statsForRoleTerm/{setRoleId}/{setTermId}")]
        public async Task<ActionResult<WorkRoleTermStatsVM>> GetWorkRoleTermStats(int id, int setRoleId, int setTermId)
        {
            var userId = Guid.Parse(User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value);
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var set = await _context.Sets.FindAsync(work.SetId);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var setQuestionsStats = await _context.SetQuestions.Where(sq => sq.SetRoleId == setRoleId && sq.SetTermId == setTermId)
                .GroupBy(sq => 1)
                .Select(sq => new QuestionsPointsStats { Questions = sq.Count(), Points = sq.Sum(s => s.Points) }).SingleOrDefaultAsync();
            var workAnswers = await _context.WorkEvaluations
                .Include(wa => wa.SetQuestion)
                .Include(wa => wa.SetAnswer)
                .Where(wa => wa.WorkId == id && wa.SetQuestion.SetRoleId == setRoleId && wa.SetQuestion.SetTermId == setTermId).ToListAsync();
            int answeredQuestions = 0;
            int answeredPoints = 0;
            int maxPoints = 0;
            int criticals = 0;
            int criticalsInTerm = 0;
            foreach (var wa in workAnswers)
            {
                answeredQuestions++;
                maxPoints += wa.SetQuestion.Points;
                answeredPoints += wa.Points;
                if (wa.SetAnswer.Critical) criticals++;
                if (wa.SetAnswer.CriticalInTerm) criticalsInTerm++;
            }
            double rating = maxPoints > 0 ? (double)answeredPoints / maxPoints : 0;
            double effectiveRating = criticals > 0 ? 0 : rating;
            var setRatingValue = await _context.ScaleValues
                .Where(sv => (sv.ScaleId == set.ScaleId) && (sv.Rate >= effectiveRating))
                .OrderBy(sv => sv.Rate)
                .FirstOrDefaultAsync();
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (isEvaluator.Succeeded)
            {
                return Ok(new WorkRoleTermStatsVM
                {
                    TotalQuestions = setQuestionsStats.Questions,
                    TotalPoints = setQuestionsStats.Points,
                    FilledQuestions = answeredQuestions,
                    GainedPoints = answeredPoints,
                    FilledPoints = maxPoints,
                    CriticalAnswers = criticals,
                    CriticalInTerm = criticalsInTerm,
                    CalculatedMark = (setRatingValue != null && answeredQuestions > 0) ? setRatingValue.Name : "?"
                });
            }
            else
            {
                return Ok(new WorkRoleTermStatsVM
                {
                    TotalQuestions = setQuestionsStats.Questions,
                    TotalPoints = setQuestionsStats.Points,
                    FilledQuestions = answeredQuestions,
                    GainedPoints = 0,
                    FilledPoints = 0,
                    CriticalAnswers = 0,
                    CriticalInTerm = 0
                });
            }
        }

        // statistics for role
        [Authorize]
        [HttpGet("{id}/statsForRole/{setRoleId}")]
        public async Task<ActionResult<WorkRoleTermStatsVM>> GetWorkRoleStats(int id, int setRoleId)
        {
            var userId = Guid.Parse(User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value);
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var set = await _context.Sets.FindAsync(work.SetId);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var setQuestionsStats = await _context.SetQuestions.Where(sq => sq.SetRoleId == setRoleId)
                .GroupBy(sq => 1)
                .Select(sq => new QuestionsPointsStats { Questions = sq.Count(), Points = sq.Sum(s => s.Points) }).SingleOrDefaultAsync();
            var workAnswers = await _context.WorkEvaluations
                .Include(wa => wa.SetQuestion)
                .Include(wa => wa.SetAnswer)
                .Where(wa => wa.WorkId == id && wa.SetQuestion.SetRoleId == setRoleId).ToListAsync();
            int answeredQuestions = 0;
            int answeredPoints = 0;
            int maxPoints = 0;
            int criticals = 0;
            int criticalsInTerm = 0;
            foreach (var wa in workAnswers)
            {
                answeredQuestions++;
                maxPoints += wa.SetQuestion.Points;
                answeredPoints += wa.Points;
                if (wa.SetAnswer.Critical) criticals++;
                if (wa.SetAnswer.CriticalInTerm) criticalsInTerm++;
            }
            double rating = maxPoints > 0 ? (double)answeredPoints / maxPoints : 0;
            double effectiveRating = criticals > 0 ? 0 : rating;
            var setRatingValue = await _context.ScaleValues
                .Where(sv => (sv.ScaleId == set.ScaleId) && (sv.Rate >= effectiveRating))
                .OrderBy(sv => sv.Rate)
                .FirstOrDefaultAsync();
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (isEvaluator.Succeeded)
            {
                return Ok(new WorkRoleTermStatsVM
                {
                    TotalQuestions = setQuestionsStats.Questions,
                    TotalPoints = setQuestionsStats.Points,
                    FilledQuestions = answeredQuestions,
                    GainedPoints = answeredPoints,
                    FilledPoints = maxPoints,
                    CriticalAnswers = criticals,
                    CriticalInTerm = criticalsInTerm,
                    CalculatedMark = (setRatingValue != null && answeredQuestions > 0) ? setRatingValue.Name : "?"
                });
            }
            else
            {
                return Ok(new WorkRoleTermStatsVM
                {
                    TotalQuestions = setQuestionsStats.Questions
                });
            }
        }

        // set questions
        [Authorize]
        [HttpGet("{id}/questions/{setRoleId}/{setTermId}")]
        public async Task<ActionResult<IEnumerable<SetQuestion>>> GetWorkQuestions(int id, int setRoleId, int setTermId)
        {
            var work = await _context.Works.Include(w => w.Author).Where(w => w.Id == id).FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound("work not found");
            }
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, work.AuthorId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only author or privileged user can list questions for this work");
            }
            var setQuestions = _context.SetQuestions
                .Where(sq => sq.SetRoleId == setRoleId && sq.SetTermId == setTermId)
                .OrderBy(sq => sq.Order)
                .AsNoTracking();
            return Ok(setQuestions);
        }

        [Authorize]
        [HttpGet("{id}/questions/{questionId}", Name = "GetWorkQuestion")]
        public async Task<ActionResult<SetQuestion>> GetWorkQuestion(int id, int questionId)
        {
            var work = await _context.Works
                .Include(w => w.Author)
                .Where(w => w.Id == id).FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound("work not found");
            }
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, work.AuthorId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only author or privileged user can list questions for this work");
            }
            var @question = await _context.SetQuestions.FindAsync(questionId);
            if (@question == null)
            {
                return NotFound("question not found");
            }
            return Ok(question);
        }

        [Authorize]
        [HttpGet("{id}/questions/{questionId}/answers")]
        public async Task<ActionResult<IEnumerable<SetAnswer>>> GetWorkAnswers(int id, int questionId)
        {
            var work = await _context.Works.Include(w => w.Author).Where(w => w.Id == id).FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound("work not found");
            }
            var question = await _context.SetQuestions.FindAsync(questionId);
            if (question == null)
            {
                return NotFound("question not found");
            }
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, work.AuthorId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only author or privileged user can list answers for questions of this work");
            }
            var setAnswers = _context.SetAnswers
                .Where(sa => sa.SetQuestionId == questionId)
                .OrderByDescending(sa => sa.Rating)
                .ToList();
            return Ok(setAnswers);
        }

        [Authorize]
        [HttpGet("{id}/questions/{questionId}/evaluation")]
        public async Task<ActionResult<WorkEvaluation>> GetWorkEvaluation(int id, int questionId)
        {
            var work = await _context.Works.Include(w => w.Author).Where(w => w.Id == id).FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound("work not found");
            }
            var question = await _context.SetQuestions.FindAsync(questionId);
            if (question == null)
            {
                return NotFound("question not found");
            }
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, work.AuthorId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only author or privileged user can list answers for questions of this work");
            }
            var workEvaluation = _context.WorkEvaluations
                .Include(we => we.SetAnswer)
                .Where(we => we.SetQuestionId == questionId && we.WorkId == id)
                .SingleOrDefault();
            if (workEvaluation == null)
            {
                return NotFound("evaluation does not exist (yet)");
            }
            return Ok(workEvaluation);
        }

        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        [HttpPost("{id}/questions/{questionId}/evaluation")]
        public async Task<ActionResult> PostWorkEvaluation(int id, int questionId, [FromBody] WorkAnswerIM input)
        {
            if (id != input.WorkId || questionId != input.QuestionId)
            {
                return BadRequest("request is inconsistent");
            }
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var question = await _context.SetQuestions.FindAsync(questionId);
            _context.Entry(question).Reference(q => q.Role).Load();
            if (question == null)
            {
                return NotFound("question not found");
            }
            var answer = await _context.SetAnswers.FindAsync(input.AnswerId);
            if (answer == null)
            {
                return NotFound("answer not found");
            }
            var role = await _context.WorkRoles.Where(wr => wr.SetRoleId == question.SetRoleId && wr.WorkId == work.Id).SingleOrDefaultAsync();
            _context.Entry(role).Collection(wr => wr.WorkRoleUsers).Load();
            if (role == null)
            {
                return NotFound("role not found");
            }
            if (role.Finalized)
            {
                return BadRequest("evaluation in this role has been finalized");
            }
            if (answer.SetQuestionId != questionId)
            {
                return BadRequest("answer is not in this specific question");
            }
            ICollection<string> evaluators = role.WorkRoleUsers.Select(wru => wru.UserId.ToString()).ToArray();
            var userId = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (!evaluators.Contains(userId) && !isAdmin.Succeeded)
            {
                return Unauthorized("user is nor administrator nor evaluator in this role");
            }
            if (work.State != WorkState.WorkedOut && work.State != WorkState.Delivered)
            {
                return BadRequest("work is in invalid state");
            }
            var evaluationRecord = _context.WorkEvaluations.Where(we => we.WorkId == work.Id && we.SetQuestionId == question.Id).SingleOrDefault();
            if (evaluationRecord != null)
            {
                _context.WorkEvaluations.Remove(evaluationRecord);
                _context.SaveChanges();
            }
            WorkEvaluation newRecord = new WorkEvaluation { 
                WorkId = work.Id,
                SetQuestionId = question.Id,
                SetAnswerId = answer.Id,
                CreatedById = Guid.Parse(userId),
                Created = DateTime.Now
            };
            _context.WorkEvaluations.Add(newRecord);
            _context.SaveChanges();

            return Ok(newRecord);
        }

        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        [HttpDelete("{id}/questions/{questionId}/evaluation")]
        public async Task<ActionResult> DeleteWorkEvaluation(int id, int questionId)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null)
            {
                return NotFound("work not found");
            }
            var question = await _context.SetQuestions.FindAsync(questionId);
            _context.Entry(question).Reference(q => q.Role).Load();
            if (question == null)
            {
                return NotFound("question not found");
            }
            var role = await _context.WorkRoles.Where(wr => wr.SetRoleId == question.SetRoleId && wr.WorkId == work.Id).SingleOrDefaultAsync();
            _context.Entry(role).Collection(wr => wr.WorkRoleUsers).Load();
            if (role == null)
            {
                return NotFound("role not found");
            }
            if (role.Finalized)
            {
                return BadRequest("evaluation in this role has been finalized");
            }
            ICollection<string> evaluators = role.WorkRoleUsers.Select(wru => wru.UserId.ToString()).ToArray();
            var userId = User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (!evaluators.Contains(userId) && !isAdmin.Succeeded)
            {
                return Unauthorized("user is nor administrator nor evaluator in this role");
            }
            if (work.State != WorkState.WorkedOut && work.State != WorkState.Delivered)
            {
                return BadRequest("work is in invalid state");
            }
            var evaluationRecord = _context.WorkEvaluations.Where(we => we.WorkId == work.Id && we.SetQuestionId == question.Id).SingleOrDefault();
            if (evaluationRecord != null)
            {
                _context.WorkEvaluations.Remove(evaluationRecord);
                _context.SaveChanges();
            }

            return Ok(evaluationRecord);
        }

        // notes
        [Authorize]
        [HttpGet("{id}/notes")]
        public async Task<ActionResult<WorkRoleTermStatsVM>> GetWorkNotes(int id)
        {
            var work = await _context.Works.Where(w => w.Id == id).FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound("work not found");
            }
            var notes = _context.WorkNotes
                .Include(wn => wn.CreatedBy)
                .Where(wn => wn.Work == work)
                .OrderBy(wn => wn.Created)
                .AsNoTracking();
            return Ok(notes);
        }

        [Authorize]
        [HttpGet("{workId}/notes/{id}")]
        public async Task<ActionResult<WorkRoleTermStatsVM>> GetWorkNote(int workId, int id)
        {
            var work = await _context.Works.Where(w => w.Id == workId).FirstOrDefaultAsync();
            if (work == null)
            {
                return NotFound("work not found");
            }
            var note = _context.WorkNotes
                .Where(wn => wn.Id == id)
                .SingleOrDefaultAsync();
            return Ok(note);
        }

        // print version of application
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
                return Forbid("You are not allowed do download application for this work");
            }
            if (work.State == WorkState.InPreparation)
            {
                return BadRequest("unable to render application for work in preparation state");
            }
            var set = await _context.Sets.Where(s => s.Id == work.SetId).FirstOrDefaultAsync();
            if (set == null)
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

        // print version of review
        [HttpGet("{id}/review")]
        [Authorize]
        public async Task<ActionResult> DownloadReview(int id, bool summary = false, bool history = false, bool text = true, bool questions = true)
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
                return Forbid("You are not allowed do download review for this work");
            }
            if (work.State < WorkState.Evaluated)
            {
                return BadRequest("unable to render review for work in other then evaluated or finished state");
            }
            var set = await _context.Sets.Where(s => s.Id == work.SetId).FirstOrDefaultAsync();
            if (set == null)
            {
                return NotFound("set not found");
            }

            if (!isEvaluator.Succeeded) summary = false;

            var roles = _context.WorkRoles.Include(wr => wr.SetRole)
                .Where(wr => wr.WorkId == id && wr.SetRole.PrintedInApplication == true)
                .Include(wr => wr.WorkRoleUsers).ThenInclude(wru => wru.User)
                .Include(wr => wr.SetRole)
                .Include(wr => wr.WorkRoleQuestions)
                .ToList();

            string templateFileName = "";
            string outputFileName = "";
            bool containSummary = summary;
            bool containHistory = history;
            bool containText = text;
            bool containQuestions = questions;
            switch (set.Template)
            {
                case ApplicationTemplate.SeminarWork:
                    {
                        templateFileName = "/Prints/Pages/ReviewSeminar.cshtml";
                        outputFileName = "RP" + set.Year + "_";
                        break;
                    }
                case ApplicationTemplate.GraduationWorkHigher:
                    {
                        templateFileName = "/Prints/Pages/ReviewGraduationHigher.cshtml";
                        outputFileName = "AP" + set.Year + "_";
                        break;
                    }
                default:
                    {
                        templateFileName = "/Prints/Pages/ReviewGraduation.cshtml";
                        outputFileName = "MP" + set.Year + "_";
                        break;
                    }
            }
            outputFileName += work.Name;
            string documentBody = await _razorRenderer.RenderViewToStringAsync(templateFileName, new ReviewVM
            {
                AuthorName = work.Author.Name,
                ClassName = work.ClassName,
                Title = work.Name,
                Subject = work.Subject,
                Description = work.Description,
                SetName = set.Name,
                AppUrl = HtmlEncoder.Default.Encode(Request.Scheme + "://" + Request.Host.Value),
                Date = DateTime.Now,
                HasHistory = containHistory,
                HasSummary = containSummary,
                HasText = containText,
                HasQuestions = containQuestions,
                Roles = roles,
            });
            MemoryStream memory = new(Encoding.UTF8.GetBytes(documentBody));
            return File(memory, "text/html", outputFileName + ".html");
        }

        // print version of review for selected works
        [HttpGet("{ids}/reviews")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult> DownloadReviews(string ids, bool summary = false, bool history = false, bool text = true, bool questions = true)
        {
            string[] workIdStrings = ids.Split(",");
            List<int> worksId = new List<int>();
            foreach (string i in workIdStrings)
            {
                int num = 0;
                bool ok = Int32.TryParse(i, out num);
                if (ok) worksId.Add(num);
            }
            var works = await _context.Works.Include(w => w.Author).Where(w => worksId.Contains(w.Id)).ToListAsync();
            if (works == null)
            {
                return NotFound("no works found");
            }

            var set = await _context.Sets.Where(s => s.Id == works[0].SetId).FirstOrDefaultAsync();
            if (set == null)
            {
                return NotFound("set not found");
            }

            Dictionary<int, List<WorkRole>> rolesInWork = new Dictionary<int, List<WorkRole>>();
            foreach(var w in works)
            {
                rolesInWork.Add(w.Id, _context.WorkRoles.Include(wr => wr.SetRole)
                .Where(wr => wr.WorkId == w.Id && wr.SetRole.PrintedInApplication == true)
                .Include(wr => wr.WorkRoleUsers).ThenInclude(wru => wru.User)
                .Include(wr => wr.SetRole)
                .Include(wr => wr.WorkRoleQuestions)
                .ToList());
            }

            string templateFileName = "";
            string outputFileName = "";
            bool containSummary = summary;
            bool containHistory = history;
            bool containText = text;
            bool containQuestions = questions;
            switch (set.Template)
            {
                case ApplicationTemplate.SeminarWork:
                    {
                        templateFileName = "/Prints/Pages/ReviewsSeminar.cshtml";
                        outputFileName = "RP" + set.Year + "_";
                        break;
                    }
                case ApplicationTemplate.GraduationWorkHigher:
                    {
                        templateFileName = "/Prints/Pages/ReviewsGraduationHigher.cshtml";
                        outputFileName = "AP" + set.Year + "_";
                        break;
                    }
                default:
                    {
                        templateFileName = "/Prints/Pages/ReviewsGraduation.cshtml";
                        outputFileName = "MP" + set.Year + "_";
                        break;
                    }
            }
            outputFileName += "Posudky";
            string documentBody = await _razorRenderer.RenderViewToStringAsync(templateFileName, new ReviewsVM
            {
                Works = works,
                Roles = rolesInWork,
                SetName = set.Name,
                AppUrl = HtmlEncoder.Default.Encode(Request.Scheme + "://" + Request.Host.Value),
                Date = DateTime.Now,
                HasHistory = containHistory,
                HasSummary = containSummary,
                HasText = containText,
                HasQuestions = containQuestions
            });
            MemoryStream memory = new(Encoding.UTF8.GetBytes(documentBody));
            return File(memory, "text/html", outputFileName + ".html");
        }

        // print version of applications for selected works
        [HttpGet("{ids}/applications")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult> DownloadApplications(string ids)
        {
            string[] workIdStrings = ids.Split(",");
            List<int> worksId = new List<int>();
            foreach (string i in workIdStrings)
            {
                int num = 0;
                bool ok = Int32.TryParse(i, out num);
                if (ok) worksId.Add(num);
            }
            var works = await _context.Works.Include(w => w.Author).Include(w => w.Goals).Include(w => w.Outlines).Where(w => worksId.Contains(w.Id)).ToListAsync();
            if (works == null)
            {
                return NotFound("no works found");
            }

            var set = await _context.Sets.Where(s => s.Id == works[0].SetId).FirstOrDefaultAsync();
            if (set == null)
            {
                return NotFound("set not found");
            }

            Dictionary<int, List<WorkRole>> rolesInWork = new Dictionary<int, List<WorkRole>>();
            foreach (var w in works)
            {
                rolesInWork.Add(w.Id, _context.WorkRoles.Include(wr => wr.SetRole)
                .Where(wr => wr.WorkId == w.Id && wr.SetRole.PrintedInApplication == true)
                .Include(wr => wr.WorkRoleUsers).ThenInclude(wru => wru.User)
                .Include(wr => wr.SetRole)
                .Include(wr => wr.WorkRoleQuestions)
                .ToList());
            }

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
                        templateFileName = "/Prints/Pages/AssignmentsSeminar.cshtml";
                        break;
                    }
                case ApplicationTemplate.GraduationWorkHigher:
                    {
                        templateFileName = "/Prints/Pages/AssignmentsGraduationHigher.cshtml";
                        break;
                    }
                default:
                    {
                        templateFileName = "/Prints/Pages/AssignmentsGraduation.cshtml";
                        break;
                    }
            }
            outputFileName += "Přihlášky";
            string documentBody = await _razorRenderer.RenderViewToStringAsync(templateFileName, new AssignmentsVM
            {
                Works = works,
                Roles = rolesInWork,
                Set = set,
                AppUrl = HtmlEncoder.Default.Encode(Request.Scheme + "://" + Request.Host.Value),
                Date = DateTime.Now,
                HasClassTeacherSignature = signClassTeacher,
                HasConsultantSignature = signConsultant,
                HasDepartmentHeadSignature = signDepartmentHead,
                HasDirectorSignature = signDirector,
                HasGarantSignature = signGarant,
            });
            MemoryStream memory = new(Encoding.UTF8.GetBytes(documentBody));
            return File(memory, "text/html", outputFileName + ".html");
        }

        [HttpGet("{ids}/list")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult> DownloadList(string ids, string splitter = ";")
        {
            string[] workIdStrings = ids.Split(",");
            List<int> worksId = new List<int>();
            foreach (string i in workIdStrings)
            {
                int num = 0;
                bool ok = Int32.TryParse(i, out num);
                if (ok) worksId.Add(num);
            }
            var works = await _context.Works.Include(w => w.Author).Include(w => w.Roles).ThenInclude(r => r.WorkRoleUsers).ThenInclude(wru => wru.User).Where(w => worksId.Contains(w.Id)).ToListAsync();
            if (works == null)
            {
                return NotFound("no works found");
            }
            var set = await _context.Sets.Where(s => s.Id == works[0].SetId).FirstOrDefaultAsync();
            if (set == null)
            {
                return NotFound("set not found");
            }

            var csvContent = new StringBuilder();
            foreach (var work in works)
            {
                csvContent.Append($"{work.Name}{splitter}{work.State}{splitter}{work.Author.Name}{splitter}{work.ClassName}{splitter}");
                foreach (var role in work.Roles)
                {
                    var users = role.WorkRoleUsers.Select(wru => wru.User.Name).ToArray();
                    csvContent.Append(String.Join(" + ",users));
                    csvContent.Append($"{splitter}{role.MarkText}{splitter}");
                }
                csvContent.AppendLine();
            }

            var data = Encoding.UTF8.GetBytes(csvContent.ToString());
            var result = Encoding.UTF8.GetPreamble().Concat(data).ToArray();
            return File(result, "application/csv", "seznam.csv");
            //MemoryStream memory = new(Encoding.UTF8.GetBytes(csvContent.ToString()));
            //return File(memory, "text/html", "seznam.csv");
        }
    }
}
