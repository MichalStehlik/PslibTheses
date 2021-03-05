using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PslibTheses.Data;
using PslibTheses.Model;
using PslibTheses.ViewModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PslibTheses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IdeasController : ControllerBase
    {
        private readonly ThesesContext _context;
        private readonly ILogger<IdeasController> _logger;
        private readonly IAuthorizationService _authorizationService;

        public IdeasController(ThesesContext context, ILogger<IdeasController> logger, IAuthorizationService authorizationService)
        {
            _context = context;
            _logger = logger;
            _authorizationService = authorizationService;
        }

        // GET: Ideas
        /// <summary>
        /// Gets list of ideas satisfying given parameters.
        /// </summary>
        /// <param name="search">If Name of record contains this text, this record will be returned.</param>
        /// <param name="name">If Name of record contains this text, this record will be returned.</param>
        /// <param name="subject">If Subject of record contains this text, this record will be returned.</param>
        /// <param name="userId">If Id of author of this record is same as this value, this record will be returned.</param>
        /// <param name="firstname">If firstname of author of this record contains this text, this record will be returned.</param>
        /// <param name="lastname">If lastname of author of this record contains this text, this record will be returned.</param>
        /// <param name="target">Filters ideas for specific target group based on Id of Target.</param>
        /// <param name="offered">Filters ideas which are offered (or not) to students.</param>
        /// <param name="order">Sorting order of result - valid values are: name, name_desc, firstname, firstname_desc, lastname, lastname_desc, id, id_desc, updated, updated_desc,</param>
        /// <param name="page">Index of currently returned page of result. Starts with 0, which is default value.</param>
        /// <param name="pagesize">Size of returned page. Default is 0. In such case, no paging is performed.</param>
        /// <returns></returns>
        [HttpGet]
        public ActionResult<IEnumerable<IdeaListVM>> GetIdeas(
            string search = null,
            string name = null,
            string subject = null,
            Guid? userId = null,
            string firstname = null,
            string lastname = null,
            int? target = null,
            bool? offered = null,
            string order = "name",
            int page = 0,
            int pagesize = 0)
        {
            IQueryable<Idea> ideas = _context.Ideas
                .Include(i => i.User)
                .Include(i => i.IdeaOffers)
                .Include(i => i.IdeaTargets)
                .ThenInclude(it => it.Target);
            int total = ideas.CountAsync().Result;
            if (!String.IsNullOrEmpty(search))
                ideas = ideas.Where(i => (i.Name.Contains(search)));
            if (!String.IsNullOrEmpty(name))
                ideas = ideas.Where(i => (i.Name.Contains(name)));
            if (!String.IsNullOrEmpty(subject))
                ideas = ideas.Where(i => (i.Subject.Contains(subject)));
            if (!String.IsNullOrEmpty(firstname))
                ideas = ideas.Where(i => (i.User.FirstName.Contains(firstname)));
            if (!String.IsNullOrEmpty(lastname))
                ideas = ideas.Where(i => (i.User.LastName.Contains(lastname)));
            if (userId != null)
                ideas = ideas.Where(i => (i.UserId == userId));
            if (offered != null)
                if (offered == true) ideas = ideas.Where(i => (i.IdeaOffers.Count > 0)); else ideas = ideas.Where(i => (i.IdeaOffers.Count == 0));
            if (target != null)
                ideas = ideas.Where(i => (i.IdeaTargets.Where(it => it.TargetId == target).Count() > 0));
            int filtered = ideas.CountAsync().Result;
            ideas = order switch
            {
                "id" => ideas.OrderBy(t => t.Id),
                "id_desc" => ideas.OrderByDescending(t => t.Id),
                "firstname" => ideas.OrderBy(t => t.User.FirstName),
                "firstname_desc" => ideas.OrderByDescending(t => t.User.FirstName),
                "lastname" => ideas.OrderBy(t => t.User.LastName),
                "lastname_desc" => ideas.OrderByDescending(t => t.User.LastName),
                "updated" => ideas.OrderBy(t => t.Updated),
                "updated_desc" => ideas.OrderByDescending(t => t.Updated),
                "name_desc" => ideas.OrderByDescending(t => t.Name),
                _ => ideas.OrderBy(t => t.Name),
            };
            if (pagesize != 0)
            {
                ideas = ideas.Skip(page * pagesize).Take(pagesize);
            }
            List<IdeaListVM> ideasVM = ideas.Select(i => new IdeaListVM
            {
                Id = i.Id,
                Name = i.Name,
                Description = i.Description,
                Participants = i.Participants,
                Subject = i.Subject,
                Resources = i.Resources,
                UserFirstName = i.User.FirstName,
                UserLastName = i.User.LastName,
                UserId = i.UserId,
                Created = i.Created,
                Offered = (i.IdeaOffers.Count > 0),
                Updated = i.Updated,
                Targets = i.IdeaTargets.Select(it => it.Target)
            }).ToList();
            int count = ideasVM.Count;
            return Ok(new { total = total, filtered = filtered, count = count, page = page, pages = ((pagesize == 0) ? 0 : Math.Ceiling((double)filtered / pagesize)), data = ideasVM });
        }

        // GET: Ideas/5
        /// <summary>
        /// Gets data of one idea specified by his Id, returns pure data without targets, goals, contents or user data.
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <returns>Idea</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<IdeaVM>> GetIdea(int id)
        {
            var idea = await _context.Ideas.FindAsync(id);

            if (idea == null)
            {
                return NotFound();
            }

            return Ok(new IdeaVM
            {
                Id = idea.Id,
                Name = idea.Name,
                Description = idea.Description,
                Subject = idea.Subject,
                Resources = idea.Resources,
                UserId = idea.UserId,
                Participants = idea.Participants,
                Updated = idea.Updated,
                Created = idea.Created
            }
            );
        }

        // GET: Ideas/5/full
        /// <summary>
        /// Gets data of one idea specified by his Id, returns data from immediately associated tables.
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <returns>Idea</returns>
        [HttpGet("{id}/full")]
        [Authorize]
        public async Task<ActionResult<IdeaVM>> GetFullIdea(int id)
        {
            var idea = await _context.Ideas
                .Where(i => i.Id == id)
                .Select(i => new {
                    i.Id,
                    i.Name,
                    i.User,
                    i.Description,
                    i.Participants,
                    i.Resources,
                    i.Subject,
                    i.Updated,
                    i.Created,
                    i.Goals,
                    i.Outlines,
                    i.IdeaTargets
                })
                .FirstOrDefaultAsync();
            if (idea == null)
            {
                return NotFound();
            }

            return Ok(idea);
        }

        // PUT: Ideas/5
        /// <summary>
        /// Overwrites basic data of an idea specified by his Id
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="input">Idea data in body of request</param>
        /// <returns>HTTP 204, 404, 400</returns>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutIdea(int id, [FromBody] IdeaIM input)
        {
            if (id != input.Id)
            {
                return BadRequest();
            }
            var idea = await _context.Ideas.FindAsync(id);
            _context.Entry(idea).State = EntityState.Modified;
            if (idea == null)
            {
                return NotFound();
            }

            var user = _context.Users.FindAsync(input.UserId).Result;
            if (user == null)
            {
                return NotFound("User with Id equal to userId was not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can edit an idea");
            }

            idea.Name = input.Name;
            idea.Description = input.Description;
            idea.Resources = input.Resources;
            idea.Subject = input.Subject;
            idea.Participants = input.Participants;
            idea.User = user;
            idea.Updated = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IdeaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("idea update faled", ex, idea);
                throw;
            }
            _logger.LogInformation("idea updated", idea);
            return NoContent();
        }

        // POST: Ideas
        /// <summary>
        /// Creates and stores a new idea
        /// </summary>
        /// <param name="ideaIM">Data of an idea</param>
        /// <returns>HTTP 201</returns>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Idea>> PostIdea(IdeaIM ideaIM)
        {
            var idea = new Idea
            {
                Name = ideaIM.Name,
                Description = ideaIM.Description,
                Resources = ideaIM.Resources,
                Subject = ideaIM.Subject,
                Participants = ideaIM.Participants,
                UserId = Guid.Parse(User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value),
                Created = DateTime.Now,
                Updated = DateTime.Now
            };
            _context.Ideas.Add(idea);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetIdea", new { id = idea.Id }, idea);
        }

        // DELETE: Ideas/5
        /// <summary>
        /// Removes idea from database
        /// </summary>
        /// <param name="id">Id of idea</param>
        /// <returns>Removed idea, HTTP 404</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<Idea>> DeleteIdea(int id)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound();
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can delete an idea");
            }

            _context.Ideas.Remove(idea);
            await _context.SaveChangesAsync();

            return Ok(idea);
        }

        private bool IdeaExists(int id)
        {
            return _context.Ideas.Any(e => e.Id == id);
        }

        // --- targets
        // GET: Ideas/5/targets
        /// <summary>
        /// Fetch all target groups for this idea
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <returns>Array of idea targets</returns>
        [HttpGet("{id}/targets")]
        public async Task<ActionResult<IEnumerable<Target>>> GetIdeaTargets(int id)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var ideaTargets = _context.IdeaTargets
                .Where(it => it.Idea == idea)
                .OrderBy(it => it.Target.Text)
                .Select(it => new { Text = it.Target.Text, Color = it.Target.Color, Id = it.Target.Id })
                .AsNoTracking();
            return Ok(ideaTargets);
        }

        // GET: Ideas/5/allTargets
        /// <summary>
        /// Fetch all targets groups (not just assigned)
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <returns>Array of targets</returns>
        [HttpGet("{id}/allTargets")]
        [HttpGet("allTargets")]
        public ActionResult<IEnumerable<Target>> GetAllIdeaTargets()
        {
            var targets = _context.Targets
                .OrderBy(t => t.Text)
                .Select(t => new { Text = t.Text, Color = t.Color, Id = t.Id })
                .AsNoTracking();
            return Ok(targets);
        }

        // GET: Ideas/5/unusedTargets
        /// <summary>
        /// Fetch all targets groups not assigned to this idea
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <returns>Array of targets</returns>
        [HttpGet("{id}/unusedTargets")]
        public async Task<ActionResult<IEnumerable<Target>>> GetUnusedIdeaTargets(int id)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var usedTargets = _context.IdeaTargets
                .Where(it => it.Idea == idea)
                .Select(it => it.Target.Id)
                .ToArray();

            var targets = _context.Targets
                .OrderBy(t => t.Text)
                .Where(t => !usedTargets.Contains(t.Id))
                .Select(t => new { Text = t.Text, Color = t.Color, Id = t.Id })
                .ToList();
            return Ok(targets);
        }

        // POST: Ideas/5/targets
        /// <summary>
        /// Adds a new Target group to this idea
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="targetId">New Target Id from requests body. If idea already contains this target, nothing happens.</param>
        /// <returns>HTTP 201, 202, 404</returns>
        [HttpPost("{id}/targets")]
        public async Task<ActionResult<IdeaTarget>> PostIdeaTarget(int id, [FromBody] IdeaTargetIdIM im)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }
            var target = await _context.Targets.FindAsync(im.Id);
            if (target == null)
            {
                return NotFound("target not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can change target audience for an idea");
            }

            var ideaTarget = _context.IdeaTargets.Where(it => it.Idea == idea && it.Target == target).FirstOrDefault();
            if (ideaTarget == null)
            {
                var newIdeaTarget = new IdeaTarget
                {
                    Idea = idea,
                    Target = target
                };
                _context.IdeaTargets.Add(newIdeaTarget);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetIdeaTargets", new { id = idea.Id }, new { IdeaId = idea.Id, TargetId = target.Id });
            }
            else
            {
                return NoContent();
            }
        }

        // DELETE: Ideas/5/targets/3
        /// <summary>
        /// Removes target group from an idea
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="targetId">Target Id</param>
        /// <returns>Removed combination of idea and target keys, HTTP 404</returns>
        [HttpDelete("{id}/targets/{targetId}")]
        public async Task<ActionResult<IdeaTarget>> DeleteIdeaTarget(int id, int targetId)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }
            var target = await _context.Targets.FindAsync(targetId);
            if (target == null)
            {
                return NotFound("target not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can delate target audience for an idea");
            }

            var ideaTarget = _context.IdeaTargets.Where(it => (it.Idea == idea && it.Target == target)).FirstOrDefault();
            if (ideaTarget != null)
            {
                _context.IdeaTargets.Remove(ideaTarget);
                _context.SaveChanges();
                return Ok(ideaTarget);
            }
            else
            {
                return NotFound("idea does not contain this specific target");
            }
        }

        // --- goals
        // GET: Ideas/5/goals
        /// <summary>
        /// Fetch list of all goals for this idea
        /// </summary>
        /// <param name="id">Idea id</param>
        /// <returns>Array of goals ordered by value in Order field, HTTP 404</returns>
        [HttpGet("{id}/goals")]
        public async Task<ActionResult<IEnumerable<IdeaGoal>>> GetIdeaGoals(int id)
        {
            var idea = await _context.Ideas.FindAsync(id);

            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var goals = _context.IdeaGoals
                .Where(ig => ig.Idea == idea)
                .Select(ig => new { IdeaId = ig.IdeaId, Order = ig.Order, Text = ig.Text })
                .OrderBy(ig => ig.Order)
                .AsNoTracking();
            return Ok(goals);
        }

        // GET: Ideas/5/goals/1
        /// <summary>
        /// Fetch specific goal of an idea in certain order
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="order">Order (1+)</param>
        /// <returns>Goal, HTTP 404</returns>
        [HttpGet("{id}/goals/{order}")]
        public async Task<ActionResult<IdeaGoal>> GetIdeaGoal(int id, int order)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var goal = _context.IdeaGoals
                .Where(ig => ig.Idea == idea && ig.Order == order)
                .Select(ig => new { IdeaId = ig.IdeaId, ig.Order, ig.Text })
                .FirstOrDefault();
            if (goal == null)
            {
                return NotFound("goal not found");
            }
            return Ok(goal);
        }

        // POST: Ideas/5/goals
        /// <summary>
        /// Creates and stores a new goal for an idea
        /// </summary>
        /// <param name="id">Idea id</param>
        /// <param name="goalText">Object containing text</param>
        /// <returns>New goal, HTTP 404</returns>
        [HttpPost("{id}/goals")]
        public async Task<ActionResult<IdeaGoal>> PostIdeaGoals(int id, [FromBody] IdeaGoalIM goalText)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can add new goal for an idea");
            }

            if (String.IsNullOrEmpty(goalText.Text))
            {
                return BadRequest("text of goal cannot be empty");
            }
            int maxGoalOrder;
            try
            {
                maxGoalOrder = _context.IdeaGoals.Where(ig => ig.IdeaId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxGoalOrder = 0;
            }
            var newGoal = new IdeaGoal { IdeaId = id, Order = maxGoalOrder + 1, Text = goalText.Text };
            _context.IdeaGoals.Add(newGoal);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetIdeaGoal", new { id = newGoal.IdeaId, order = newGoal.Order }, new { IdeaId = id, Order = maxGoalOrder + 1, Text = goalText.Text });
        }

        // PUT: Ideas/5/goals
        /// <summary>
        /// Replaces all goals inside an idea with a new ones
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="goalText">New collection of goals</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/goals")]
        public async Task<ActionResult<List<IdeaGoal>>> PutIdeaGoals(int id, [FromBody] List<IdeaGoalIM> newGoalTexts)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can replace goals of an idea");
            }

            var goals = _context.IdeaGoals.Where(ig => ig.Idea == idea).AsNoTracking().ToList();
            if (goals != null)
            {
                _context.IdeaGoals.RemoveRange(goals);
                idea.Updated = DateTime.Now;
                _context.SaveChanges();
            }

            int i = 1;
            foreach (IdeaGoalIM goal in newGoalTexts)
            {
                if (!String.IsNullOrEmpty(goal.Text))
                {
                    var newGoal = new IdeaGoal { IdeaId = id, Order = i++, Text = goal.Text };
                    _context.IdeaGoals.Add(newGoal);
                }
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: Ideas/5/goals/1
        /// <summary>
        /// Changes text of goal inside an idea
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="order">Order of goal</param>
        /// <param name="goalText">New text of goal</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/goals/{order}")]
        public async Task<ActionResult> PutIdeaGoalsOfOrder(int id, int order, [FromBody] IdeaGoalIM goalText)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can replace goal of an idea");
            }

            if (String.IsNullOrEmpty(goalText.Text))
            {
                return BadRequest("text of goal cannot be empty");
            }
            var goal = _context.IdeaGoals.Where(ig => ig.Idea == idea && ig.Order == order).FirstOrDefault();
            if (goal == null)
            {
                return NotFound("goal not found");
            }

            idea.Updated = DateTime.Now;
            goal.Text = goalText.Text;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: Ideas/5/goals/1/moveto/2
        /// <summary>
        /// Moves goal to a new position and shifts other goals to reorganize them in new order
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="order">Original position</param>
        /// <param name="newOrder">New position</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/goals/{order}/moveto/{newOrder}")]
        public async Task<ActionResult<IdeaGoal>> PutIdeaGoalsMove(int id, int order, int newOrder)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can change order of goals inside an idea");
            }

            var goal = _context.IdeaGoals.Where(ig => ig.Idea == idea && ig.Order == order).FirstOrDefault();
            if (goal == null)
            {
                return NotFound("goal not found");
            }

            int maxOrder;
            try
            {
                maxOrder = _context.IdeaGoals.Where(ig => ig.IdeaId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxOrder = 0;
            }

            if (newOrder > maxOrder) newOrder = maxOrder;

            IdeaGoal temp = new IdeaGoal { IdeaId = id, Order = newOrder, Text = goal.Text }; // future record
            _context.IdeaGoals.Remove(goal); // remove old record, we backup it in temp
            _context.SaveChanges();

            if (order > newOrder) // moving down
            {
                for (int i = order - 1; i >= newOrder; i--)
                {
                    var item = _context.IdeaGoals.Where(ig => ig.Idea == idea && ig.Order == i).FirstOrDefault();
                    if (item != null) item.Order += 1;
                    _context.SaveChanges();
                }
            }
            else if (order < newOrder) // moving up
            {
                for (int i = order + 1; i <= newOrder; i++)
                {
                    var item = _context.IdeaGoals.Where(ig => ig.Idea == idea && ig.Order == i).FirstOrDefault();
                    if (item != null) item.Order -= 1;
                    _context.SaveChanges();
                }
            }
            _context.IdeaGoals.Add(temp);
            idea.Updated = DateTime.Now;
            _context.SaveChanges();
            return NoContent();
        }

        // DELETE: Ideas/5/goals
        /// <summary>
        /// Removes all goals in specified idea
        /// </summary>
        /// <param name="id">Idea id</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpDelete("{id}/goals")]
        public async Task<ActionResult<IdeaGoal>> DeleteAllIdeaGoal(int id)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can delete all goals of an idea");
            }

            var goals = _context.IdeaGoals.Where(ig => ig.Idea == idea).AsNoTracking().ToList();
            if (goals != null)
            {
                _context.IdeaGoals.RemoveRange(goals);
                idea.Updated = DateTime.Now;
                _context.SaveChanges();
            }
            return NoContent();
        }

        // DELETE: Ideas/5/goals/1
        /// <summary>
        /// Removes selected goal and shift all others to fill hole
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="order">Order of removed goal</param>
        /// <returns>Removed goal, HTTP 404</returns>
        [HttpDelete("{id}/goals/{order}")]
        public async Task<ActionResult<IdeaGoal>> DeleteIdeaGoal(int id, int order)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }
            var goal = _context.IdeaGoals.Where(ig => ig.Idea == idea && ig.Order == order).AsNoTracking().FirstOrDefault();
            if (goal == null)
            {
                return NotFound("goal not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can delete goals inside an idea");
            }

            IdeaGoal removedGoal = new IdeaGoal { Id = goal.Id, IdeaId = id, Order = order, Text = goal.Text };
            int maxGoalOrder;
            try
            {
                maxGoalOrder = _context.IdeaGoals.Where(ig => ig.IdeaId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxGoalOrder = 0;
            }

            _context.IdeaGoals.Remove(goal);
            idea.Updated = DateTime.Now;
            _context.SaveChanges();

            for (int i = order; i <= maxGoalOrder; i++)
            {
                var row = _context.IdeaGoals.Where(ig => ig.IdeaId == id && ig.Order == i).FirstOrDefault();
                if (row != null)
                {
                    row.Order = i - 1;
                    _context.SaveChanges();
                }
            }

            return Ok(new { removedGoal.Id, removedGoal.IdeaId, removedGoal.Order, removedGoal.Text });
        }

        // --- outlines
        // GET: Ideas/5/outlines
        /// <summary>
        /// Fetch list of all outlines for this idea
        /// </summary>
        /// <param name="id">Idea id</param>
        /// <returns>Array of items ordered by value in Order field, HTTP 404</returns>
        [HttpGet("{id}/outlines")]
        public async Task<ActionResult<IEnumerable<IdeaOutline>>> GetIdeaOutlines(int id)
        {
            var idea = await _context.Ideas.FindAsync(id);

            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var contents = _context.IdeaOutlines
                .Where(ic => ic.Idea == idea)
                .Select(ic => new { IdeaId = ic.IdeaId, Order = ic.Order, Text = ic.Text })
                .OrderBy(ic => ic.Order)
                .AsNoTracking();
            return Ok(contents);
        }

        // GET: Ideas/5/outlines/1
        /// <summary>
        /// Fetch specific outline of an idea in certain order
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="order">Order (1+)</param>
        /// <returns>Content, HTTP 404</returns>
        [HttpGet("{id}/outlines/{order}")]
        public async Task<ActionResult<IdeaOutline>> GetIdeaOutline(int id, int order)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var content = _context.IdeaOutlines
                .Where(ig => ig.Idea == idea && ig.Order == order)
                .Select(ig => new { IdeaId = ig.IdeaId, ig.Order, ig.Text })
                .FirstOrDefault();
            if (content == null)
            {
                return NotFound("outline not found");
            }
            return Ok(content);
        }

        // POST: Ideas/5/outlines
        /// <summary>
        /// Creates and stores a new outline item for an idea
        /// </summary>
        /// <param name="id">Idea id</param>
        /// <param name="goalText">Object containing text</param>
        /// <returns>New goal, HTTP 404</returns>
        [HttpPost("{id}/outlines")]
        public async Task<ActionResult<IdeaGoal>> PostIdeaOutlines(int id, [FromBody] IdeaOutlineIM outlineText)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can add new outline inside an idea");
            }

            if (String.IsNullOrEmpty(outlineText.Text))
            {
                return BadRequest("text of outline cannot be empty");
            }
            int maxOrder;
            try
            {
                maxOrder = _context.IdeaOutlines.Where(ig => ig.IdeaId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxOrder = 0;
            }
            var newOutline = new IdeaOutline { IdeaId = id, Order = maxOrder + 1, Text = outlineText.Text };
            _context.IdeaOutlines.Add(newOutline);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetIdeaOutline", new { id = newOutline.IdeaId, order = newOutline.Order }, new { IdeaId = id, Order = maxOrder + 1, Text = outlineText.Text });
        }

        // PUT: Ideas/5/outlines
        /// <summary>
        /// Replaces all outlines inside an idea with a new ones
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="goalText">New collection of outlines</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/outlines")]
        public async Task<ActionResult<List<IdeaGoal>>> PutIdeaOutlines(int id, [FromBody] List<IdeaOutlineIM> newOutlineTexts)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can replace outlines of an idea");
            }

            var outlines = _context.IdeaOutlines.Where(ig => ig.Idea == idea).AsNoTracking().ToList();
            if (outlines != null)
            {
                _context.IdeaOutlines.RemoveRange(outlines);
                idea.Updated = DateTime.Now;
                _context.SaveChanges();
            }

            int i = 1;
            foreach (IdeaOutlineIM outline in newOutlineTexts)
            {
                if (!String.IsNullOrEmpty(outline.Text))
                {
                    var newOutline = new IdeaOutline { IdeaId = id, Order = i++, Text = outline.Text };
                    _context.IdeaOutlines.Add(newOutline);
                }
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: Ideas/5/outlines/1
        /// <summary>
        /// Changes text of outline inside na idea
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="order">Order of outline</param>
        /// <param name="goalText">New text of outline</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/outlines/{order}")]
        public async Task<ActionResult<IdeaOutline>> PutIdeaOutlineOfOrder(int id, int order, [FromBody] IdeaOutlineIM outlineText)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can change outline inside an idea");
            }

            if (String.IsNullOrEmpty(outlineText.Text))
            {
                return BadRequest("text of outline cannot be empty");
            }
            var outline = _context.IdeaOutlines.Where(io => io.Idea == idea && io.Order == order).FirstOrDefault();
            if (outline == null)
            {
                return NotFound("outline not found");
            }

            idea.Updated = DateTime.Now;
            outline.Text = outlineText.Text;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: Ideas/5/outlines/1/moveto/2
        /// <summary>
        /// Moves outline to a new position and shifts other outline points to reorganize them in new order
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="order">Original position</param>
        /// <param name="newOrder">New position</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPut("{id}/outlines/{order}/moveto/{newOrder}")]
        public async Task<ActionResult<IdeaGoal>> PutIdeaOutlinesMove(int id, int order, int newOrder)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can change order of outlines inside an idea");
            }

            var outline = _context.IdeaOutlines.Where(ig => ig.Idea == idea && ig.Order == order).FirstOrDefault();
            if (outline == null)
            {
                return NotFound("outline not found");
            }

            int maxOrder;
            try
            {
                maxOrder = _context.IdeaOutlines.Where(ig => ig.IdeaId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxOrder = 0;
            }

            if (newOrder > maxOrder) newOrder = maxOrder;

            IdeaOutline temp = new IdeaOutline { IdeaId = id, Order = newOrder, Text = outline.Text }; // future record
            _context.IdeaOutlines.Remove(outline); // remove old record, we backup it in temp
            _context.SaveChanges();

            if (order > newOrder) // moving down
            {
                for (int i = order - 1; i >= newOrder; i--)
                {
                    var item = _context.IdeaOutlines.Where(ig => ig.Idea == idea && ig.Order == i).FirstOrDefault();
                    if (item != null) item.Order += 1;
                    _context.SaveChanges();
                }
            }
            else if (order < newOrder) // moving up
            {
                for (int i = order + 1; i <= newOrder; i++)
                {
                    var item = _context.IdeaOutlines.Where(ig => ig.Idea == idea && ig.Order == i).FirstOrDefault();
                    if (item != null) item.Order = item.Order - 1;
                    _context.SaveChanges();
                }
            }
            _context.IdeaOutlines.Add(temp);
            idea.Updated = DateTime.Now;
            _context.SaveChanges();
            return NoContent();
        }

        // DELETE: Ideas/5/outlines
        /// <summary>
        /// Removes all outlines in specified idea
        /// </summary>
        /// <param name="id">Idea id</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpDelete("{id}/outlines")]
        public async Task<ActionResult<IdeaGoal>> DeleteAllIdeaOulines(int id)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can delete outlines of an idea");
            }

            var outlines = _context.IdeaOutlines.Where(ig => ig.Idea == idea).AsNoTracking().ToList();
            if (outlines != null)
            {
                _context.IdeaOutlines.RemoveRange(outlines);
                idea.Updated = DateTime.Now;
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
        public async Task<ActionResult<IdeaGoal>> DeleteIdeaOutline(int id, int order)
        {
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                return NotFound("idea not found");
            }

            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, idea.UserId.ToString()) && !isEvaluator.Succeeded)
            {
                return Unauthorized("only owner or privileged user can delete outline inside an idea");
            }

            var outline = _context.IdeaOutlines.Where(ig => ig.Idea == idea && ig.Order == order).AsNoTracking().FirstOrDefault();
            if (outline == null)
            {
                return NotFound("outline not found");
            }

            IdeaOutline removedOutline = new IdeaOutline { Id = outline.Id, IdeaId = id, Order = order, Text = outline.Text };
            int maxOrder;
            try
            {
                maxOrder = _context.IdeaOutlines.Where(ig => ig.IdeaId == id).Max(ig => ig.Order);
            }
            catch
            {
                maxOrder = 0;
            }

            _context.IdeaOutlines.Remove(outline);
            idea.Updated = DateTime.Now;
            _context.SaveChanges();

            for (int i = order; i <= maxOrder; i++)
            {
                var row = _context.IdeaOutlines.Where(ig => ig.IdeaId == id && ig.Order == i).FirstOrDefault();
                if (row != null)
                {
                    row.Order = i - 1;
                    _context.SaveChanges();
                }
            }

            return Ok(new { removedOutline.Id, removedOutline.IdeaId, removedOutline.Order, removedOutline.Text });
        }

        // Offers

        // GET: Ideas/5/offers
        /// <summary>
        /// Gets data of one idea specified by his Id, returns data from immediately associated tables.
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <returns>Idea</returns>
        [HttpGet("{id}/offers")]
        public async Task<ActionResult<List<User>>> GetOfferedIdea(int id)
        {
            var users = await _context.IdeaOffers
                .Include(io => io.User)
                .Where(io => io.IdeaId == id)
                .Select(io => new {
                    io.User.Id,
                    io.User.FirstName,
                    io.User.MiddleName,
                    io.User.LastName,
                    io.User.Email
                })
                .ToListAsync();

            return Ok(users);
        }

        // POST: Ideas/5/offers/xxx-xx-xx-xxxx
        /// <summary>
        /// Sets this idea to be offered to students by teacher
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="userid">UserId in body of request</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPost("{id}/offers")]
        [Authorize(Policy = "Evaluator")]
        public async Task<IActionResult> PostIdeaOffered(int id, [FromBody] IdeaOfferIM input)
        {
            var idea = await _context.Ideas.FindAsync(id);
            var user = await _context.Users.FindAsync(input.Id);

            _context.Entry(idea).State = EntityState.Modified;
            if (idea == null)
            {
                return NotFound("idea not found");
            }
            if (user == null)
            {
                return NotFound("user not found");
            }

            var ideaOffer = _context.IdeaOffers.Where(io => io.UserId == input.Id && io.IdeaId == id).FirstOrDefault();
            if (ideaOffer == null)
            {
                await _context.IdeaOffers.AddAsync(new IdeaOffer { IdeaId = id, UserId = input.Id });
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!IdeaExists(id))
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
            else
            {
                return NoContent();
            }
        }

        // DELETE: Ideas/5/offers/xxx-xxx-xxx-xxx
        /// <summary>
        /// Removes selected offer
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="userId">User Id</param>
        /// <returns>Removed goal, HTTP 404</returns>
        [HttpDelete("{id}/offers/{userId}")]
        [Authorize(Policy = "Evaluator")]
        public ActionResult<IdeaOffer> DeleteIdeaOffer(int id, Guid userId)
        {
            var ideaOffer = _context.IdeaOffers.Where(io => io.UserId == userId && io.IdeaId == id).FirstOrDefault();

            if (ideaOffer == null)
            {
                return NotFound();
            }

            _context.IdeaOffers.Remove(ideaOffer);
            _context.SaveChanges();

            return Ok(ideaOffer);
        }

        // DELETE: Ideas/5/offers
        /// <summary>
        /// Removes all offers for an specified idea
        /// </summary>
        /// <param name="id">Idea id</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpDelete("{id}/offers")]
        [Authorize(Policy = "Administrator")]
        public ActionResult<IdeaGoal> DeleteAllIdeaOffers(int id)
        {
            var offers = _context.IdeaOffers.Where(io => io.IdeaId == id).AsNoTracking().ToList();
            if (offers != null)
            {
                _context.IdeaOffers.RemoveRange(offers);
                _context.SaveChanges();
            }
            return NoContent();
        }
    }
}
