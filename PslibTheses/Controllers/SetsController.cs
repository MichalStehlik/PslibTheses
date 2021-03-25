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
    public class SetsController : ControllerBase
    {
        private readonly ThesesContext _context;

        public SetsController(ThesesContext context)
        {
            _context = context;
        }

        // GET: Sets
        [HttpGet]
        [Authorize]
        public ActionResult<IEnumerable<SetListVM>> GetSets(
            string search = null,
            string name = null,
            bool? active = null,
            int? year = null,
            string order = "year_desc",
            int page = 0,
            int pagesize = 0)
        {
            IQueryable<SetListVM> sets = _context.Sets.Include(s => s.Works).Select(s =>
                new SetListVM
                {
                    Id = s.Id,
                    Name = s.Name,
                    Active = s.Active,
                    Template = s.Template,
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
                "year_desc" => sets.OrderByDescending(s => s.Year),
                _ => sets.OrderBy(s => s.Year),
            };
            if (pagesize != 0)
            {
                sets = sets.Skip(page * pagesize).Take(pagesize);
            }
            var result = sets.ToList();
            int count = result.Count;

            return Ok(new { total, filtered, count, page, pages = ((pagesize == 0) ? 0 : Math.Ceiling((double)filtered / pagesize)), data = result });
        }

        // GET: Sets/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Set>> GetSet(int id)
        {
            var @set = await _context.Sets.FindAsync(id);

            if (@set == null)
            {
                return NotFound();
            }

            return @set;
        }

        // PUT: Sets/5
        [HttpPut("{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<IActionResult> PutSet(int id, Set @set)
        {
            if (id != @set.Id)
            {
                return BadRequest();
            }

            _context.Entry(@set).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SetExists(id))
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

        // POST: Sets
        [HttpPost]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<Set>> PostSet(Set @set)
        {
            _context.Sets.Add(@set);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSet", new { id = @set.Id }, @set);
        }

        // DELETE: Sets/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<Set>> DeleteSet(int id)
        {
            // TODO kontrola, zda v sadě nejsou práce
            var @set = await _context.Sets.FindAsync(id);
            if (@set == null)
            {
                return NotFound();
            }

            _context.Sets.Remove(@set);
            await _context.SaveChangesAsync();

            return @set;
        }

        private bool SetExists(int id)
        {
            return _context.Sets.Any(s => (s.Id == id));
        }

        [HttpGet("{id}/terms")]
        public ActionResult<IEnumerable<SetTerm>> GetSetTerms(int id)
        {
            if (!SetExists(id))
            {
                return NotFound("set not found");
            }

            var setTerms = _context.SetTerms
                .Where(st => st.SetId == id)
                .OrderBy(st => st.Date)
                .Select(st => new { st.Id, st.Name, st.Date, st.WarningDate, QuestionsCount = st.Questions.Count })
                .AsNoTracking();
            return Ok(setTerms);
        }

        [HttpGet("{id}/terms/{termId}")]
        public async Task<ActionResult<SetTerm>> GetSetTerm(int id, int termId)
        {
            var @set = await _context.Sets.FindAsync(id);
            if (@set == null)
            {
                return NotFound("set not found");
            }
            var @term = await _context.SetTerms.FindAsync(termId);
            if (@term == null)
            {
                return NotFound("term not found");
            }
            var setTerm = _context.SetTerms.Where(st => (st.SetId == id && st.Id == termId)).FirstOrDefault();
            if (@setTerm == null)
            {
                return NotFound("term is not in this set");
            }
            return @term;
        }

        [HttpPut("{id}/terms/{termId}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetTerm>> PutSetTerms(int id, int termId, [FromBody] SetTermIM st)
        {
            var set = await _context.Sets.FindAsync(id);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var @term = await _context.SetTerms.FindAsync(termId);
            if (@term == null)
            {
                return NotFound("term not found");
            }
            if (term.SetId != set.Id)
            {
                return BadRequest("term is not in this set");
            }
            if (st.WarningDate == default) st.WarningDate = st.Date.AddDays(-2);
            term.Name = st.Name;
            term.Date = st.Date;
            term.WarningDate = st.WarningDate;
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetSetTerm", new { id = term.SetId, termId = term.Id }, id);
        }

        [HttpDelete("{id}/terms/{termId}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetTerm>> DeleteSetTerms(int id, int termId)
        {
            var set = await _context.Sets.FindAsync(id);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var @term = await _context.SetTerms.FindAsync(termId);
            if (@term == null)
            {
                return NotFound("term not found");
            }
            var setTerm = _context.SetTerms.Where(st => (st.SetId == id && st.Id == termId)).FirstOrDefault();
            if (@setTerm == null)
            {
                return NotFound("term is not in this set");
            }
            _context.SetTerms.Remove(term);
            await _context.SaveChangesAsync();
            return term;
        }

        [HttpPost("{id}/terms")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetTerm>> PostSetTerms(int id, [FromBody] SetTermIM st)
        {
            var set = await _context.Sets.FindAsync(id);
            if (set == null)
            {
                return NotFound("set not found");
            }
            if (st.WarningDate == default) st.WarningDate = st.Date.AddDays(-2);
            var newTerm = new SetTerm { SetId = id, Name = st.Name, Date = st.Date, WarningDate = st.WarningDate };
            _context.SetTerms.Add(newTerm);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetSetTerm", new { id = newTerm.SetId, termId = newTerm.Id }, newTerm);
        }

        // --- roles
        /// <summary>
        /// Gets list of roles for given set
        /// </summary>
        /// <param name="id">Set ID</param>
        /// <returns></returns>
        [HttpGet("{id}/roles")]
        public ActionResult<IEnumerable<SetTerm>> GetSetRoles(int id)
        {
            if (!SetExists(id))
            {
                return NotFound("set not found");
            }

            var setTerms = _context.SetRoles
                .Where(st => st.SetId == id)
                .OrderBy(st => st.Name)
                .Select(st => new { st.Id, st.Name, st.ClassTeacher, st.Manager, st.PrintedInApplication, st.PrintedInReview, QuestionsCount = st.Questions.Count })
                .AsNoTracking();
            return Ok(setTerms);
        }

        /// <summary>
        /// Fetch role data
        /// </summary>
        /// <param name="id">set id</param>
        /// <param name="roleId">id of role</param>
        /// <returns>role</returns>
        [HttpGet("{id}/roles/{roleId}")]
        public async Task<ActionResult<SetRole>> GetSetRole(int id, int roleId)
        {
            var @set = await _context.Sets.FindAsync(id);
            if (@set == null)
            {
                return NotFound("set not found");
            }
            var @role = await _context.SetRoles.FindAsync(roleId);
            if (@role == null)
            {
                return NotFound("role not found");
            }
            var setRole = _context.SetRoles.Where(st => (st.SetId == id && st.Id == roleId)).FirstOrDefault();
            if (@setRole == null)
            {
                return NotFound("role is not in this set");
            }
            return @role;
        }

        /// <summary>
        /// Updates definition of role
        /// </summary>
        /// <param name="id">id of set</param>
        /// <param name="roleId">id of role</param>
        /// <param name="sr">role data</param>
        /// <returns>modified role</returns>
        [HttpPut("{id}/roles/{roleId}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetTerm>> PutSetRoles(int id, int roleId, [FromBody] SetRoleIM sr)
        {
            var set = await _context.Sets.FindAsync(id);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var @role = await _context.SetRoles.FindAsync(roleId);
            if (@role == null)
            {
                return NotFound("role not found");
            }
            if (role.SetId != set.Id)
            {
                return BadRequest("role is not in this set");
            }
            role.Name = sr.Name;
            role.ClassTeacher = sr.ClassTeacher;
            role.Manager = sr.Manager;
            role.PrintedInApplication = sr.PrintedInApplication;
            role.PrintedInReview = sr.PrintedInReview;
            await _context.SaveChangesAsync();
            return Ok(role);
        }

        /// <summary>
        /// Delete role from given set
        /// </summary>
        /// <param name="id">Set Id</param>
        /// <param name="roleId">Role Id (must be in set)</param>
        /// <returns>Deleted set</returns>
        [HttpDelete("{id}/roles/{roleId}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetRole>> DeleteSetRoles(int id, int roleId)
        {
            var set = await _context.Sets.FindAsync(id);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var @role = await _context.SetRoles.FindAsync(roleId);
            if (@role == null)
            {
                return NotFound("role not found");
            }
            var setRole = _context.SetRoles.Where(st => (st.SetId == id && st.Id == roleId)).FirstOrDefault();
            if (@setRole == null)
            {
                return NotFound("role is not in this set");
            }
            var works = _context.Works.Where(w => (w.SetId == id)).Count();
            if (works != 0)
            {
                return BadRequest("it is not possible to change number of roles after set already contains at least one work");
            }
            _context.SetRoles.Remove(role);
            await _context.SaveChangesAsync();
            return role;
        }

        /// <summary>
        /// Adds a new role into given set
        /// </summary>
        /// <param name="id">Set ID</param>
        /// <param name="sr">Data of new role</param>
        /// <returns>new role</returns>
        [HttpPost("{id}/roles")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetTerm>> PostSetRoles(int id, [FromBody] SetRoleIM sr)
        {
            var set = await _context.Sets.FindAsync(id);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var works = _context.Works.Where(w => (w.SetId == id)).Count();
            if (works != 0)
            {
                return BadRequest("it is not possible to change number of roles after set already contains at least one work");
            }
            var newRole = new SetRole
            {
                SetId = id,
                Name = sr.Name,
                ClassTeacher = sr.ClassTeacher,
                Manager = sr.Manager,
                PrintedInApplication = sr.PrintedInApplication,
                PrintedInReview = sr.PrintedInReview,
            };
            _context.SetRoles.Add(newRole);
            await _context.SaveChangesAsync();
            return Ok(newRole);
        }

        // -- stats

        [HttpGet("{setId}/summary/{termId}/{roleId}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<IEnumerable<SetQuestion>>> GetSetSummary(int setId, int termId, int roleId)
        {
            var set = await _context.Sets.FindAsync(setId);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var @role = await _context.SetRoles.FindAsync(roleId);
            if (@role == null)
            {
                return NotFound("role not found");
            }
            var @term = await _context.SetTerms.FindAsync(termId);
            if (@term == null)
            {
                return NotFound("term not found");
            }
            var questionsSummary = _context.SetQuestions
                .Where(sq => sq.SetRoleId == roleId && sq.SetTermId == termId)
                .GroupBy(g => 1)
                .Select(sq => new { questions = sq.Count(), points = sq.Sum(sq => sq.Points) });
            return Ok(questionsSummary.FirstOrDefault());
        }

        // -- works

        [HttpGet("{setId}/works")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<IEnumerable<Work>>> GetSetWorks(int setId)
        {
            var set = await _context.Sets.FindAsync(setId);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var works = await _context.Works.Where(w => w.SetId == setId).OrderBy(w => w.Name).ToListAsync();
            return Ok(works);
        }

        [HttpGet("{setId}/works/count")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<int>> GetSetWorksCount(int setId)
        {
            var set = await _context.Sets.FindAsync(setId);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var works = _context.Works.Where(w => w.SetId == setId).OrderBy(w => w.Name).Count();
            return Ok(works);
        }

        // -- questions

        /// <summary>
        /// Gets collection of question in specific term and role (both should be in same set)
        /// </summary>
        /// <param name="setId">id of set (not used)</param>
        /// <param name="termId">id of term in set</param>
        /// <param name="roleId">id of role in set</param>
        /// <returns>question</returns>
        [HttpGet("{setId}/questions/{termId}/{roleId}")]
        public ActionResult<IEnumerable<SetQuestion>> GetSetQuestions(int termId, int roleId)
        {
            var setQuestions = _context.SetQuestions
                .Where(sq => sq.SetRoleId == roleId && sq.SetTermId == termId)
                .OrderBy(sq => sq.Order)
                .AsNoTracking();
            return Ok(setQuestions);
        }

        /// <summary>
        /// Gets one question by its id
        /// </summary>
        /// <param name="id">question internal id</param>
        /// <returns>question</returns>
        [HttpGet("{setId}/questions/{id}", Name = "GetSetQuestion")]
        public async Task<ActionResult<SetRole>> GetSetQuestion(int id)
        {
            var @question = await _context.SetQuestions.FindAsync(id);
            if (@question == null)
            {
                return NotFound("question not found");
            }
            return Ok(question);
        }

        /// <summary>
        /// Gets one question from term, role and order in term+role combination
        /// </summary>
        /// <param name="termId">id of term</param>
        /// <param name="roleId">id of role</param>
        /// <param name="order">order</param>
        /// <returns></returns>
        [HttpGet("{setId}/questions/{termId}/{roleId}/{order}")]
        public async Task<ActionResult<SetRole>> GetSetQuestionOrder(int termId, int roleId, int order)
        {
            var question = await _context.SetQuestions.Where(sq => sq.SetRoleId == roleId && sq.SetTermId == termId && sq.Order == order).FirstOrDefaultAsync();
            if (@question == null)
            {
                return NotFound("question not found");
            }
            return Ok(question);
        }

        /// <summary>
        /// Creates a new question in role and term
        /// </summary>
        /// <param name="setId">id of set (not actually needed, just verified)</param>
        /// <param name="termId">id of term</param>
        /// <param name="roleId">id of role</param>
        /// <param name="item">question data</param>
        /// <returns>created question</returns>
        [HttpPost("{setId}/questions/{termId}/{roleId}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetQuestion>> PostSetQuestion(int setId, int termId, int roleId, [FromBody] SetQuestionIM item)
        {
            var set = await _context.Sets.FindAsync(setId);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var @role = await _context.SetRoles.FindAsync(roleId);
            if (@role == null)
            {
                return NotFound("role not found");
            }
            var @term = await _context.SetTerms.FindAsync(termId);
            if (@term == null)
            {
                return NotFound("term not found");
            }

            if (term.SetId != set.Id && role.SetId != set.Id)
            {
                return BadRequest("role or term is outside this set");
            }

            int maxQuestionOrder;
            try
            {
                maxQuestionOrder = _context.SetQuestions.Where(sq => sq.SetRoleId == roleId && sq.SetTermId == termId).Max(sq => sq.Order) + 1;
            }
            catch
            {
                maxQuestionOrder = 0;
            }

            var newQuestion = new SetQuestion
            {
                SetTermId = termId,
                SetRoleId = roleId,
                Text = item.Text,
                Description = item.Description,
                Points = item.Points,
                Order = maxQuestionOrder
            };
            _context.SetQuestions.Add(newQuestion);
            await _context.SaveChangesAsync();

            return Ok(newQuestion);
        }

        /// <summary>
        /// deletes question given by its internal id and reorganizes all remaining to maintain same order
        /// </summary>
        /// <param name="id">id of setquestion</param>
        /// <returns>deleted question</returns>
        [HttpDelete("{setId}/questions/{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetQuestion>> DeleteSetQuestion(int id)
        {
            var question = await _context.SetQuestions.FindAsync(id);
            if (question == null)
            {
                return NotFound("question not found");
            }

            int maxQuestionOrder;
            try
            {
                maxQuestionOrder = _context.SetQuestions.Where(sq =>
                    sq.SetRoleId == question.SetRoleId
                    &&
                    sq.SetTermId == question.SetTermId
                ).Max(sq => sq.Order);
            }
            catch
            {
                maxQuestionOrder = 0;
            }

            _context.SetQuestions.Remove(question);
            _context.SaveChanges();

            for (int i = question.Order; i <= maxQuestionOrder; i++)
            {
                var row = _context.SetQuestions.Where(sq =>
                    sq.SetRoleId == question.SetRoleId
                    &&
                    sq.SetTermId == question.SetTermId
                    &&
                    sq.Order == i).FirstOrDefault();
                if (row != null)
                {
                    row.Order = i - 1;
                    _context.SaveChanges();
                }
            }
            return Ok(question);
        }

        /// <summary>
        /// updates question by its id
        /// </summary>
        /// <param name="setId">id of set</param>
        /// <param name="questionId">id of question</param>
        /// <param name="item">question data</param>
        /// <returns>updated question</returns>
        [HttpPut("{setId}/questions/{questionId}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetQuestion>> PutSetQuestion(int setId, int questionId, [FromBody] SetQuestionIM item)
        {
            var set = await _context.Sets.FindAsync(setId);
            if (set == null)
            {
                return NotFound("set not found");
            }
            var @question = await _context.SetQuestions.FindAsync(questionId);
            if (@question == null)
            {
                return NotFound("question not found");
            }
            if (questionId != item.Id)
            {
                return BadRequest("inconsistent data");
            }
            question.Text = item.Text;
            question.Description = item.Description;
            question.Points = item.Points;
            await _context.SaveChangesAsync();
            return Ok(question);
        }

        /// <summary>
        /// changes order of specific question and reorders questions to maintain order
        /// </summary>
        /// <param name="setId">id of set</param>
        /// <param name="termId">id of term</param>
        /// <param name="roleId">id of role</param>
        /// <param name="order">current order of question</param>
        /// <param name="newOrder">new order of question</param>
        /// <returns></returns>
        [HttpPut("{setId}/questions/{termId}/{roleId}/{order}/moveto/{newOrder}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetQuestion>> PutSetQuestionMove(int setId, int termId, int roleId, int order, int newOrder)
        {
            var set = await _context.Sets.FindAsync(setId);
            if (set == null)
            {
                return NotFound("set not found");
            }

            var question = _context.SetQuestions.Where(sq => sq.SetRoleId == roleId && sq.SetTermId == termId && sq.Order == order).FirstOrDefault();
            if (question == null)
            {
                return NotFound("question not found");
            }

            int maxOrder;
            try
            {
                maxOrder = _context.SetQuestions.Where(sq => sq.SetRoleId == roleId && sq.SetTermId == termId).Max(sq => sq.Order);
            }
            catch
            {
                maxOrder = 0;
            }

            if (newOrder > maxOrder) newOrder = maxOrder;

            if (order > newOrder) // moving down
            {
                for (int i = order - 1; i >= newOrder; i--)
                {
                    var item = _context.SetQuestions.Where(sq => sq.SetRoleId == roleId && sq.SetTermId == termId && sq.Order == i).FirstOrDefault();
                    if (item != null) item.Order += 1;
                    _context.SaveChanges();
                }
            }
            else if (order < newOrder) // moving up
            {
                for (int i = order + 1; i <= newOrder; i++)
                {
                    var item = _context.SetQuestions.Where(sq => sq.SetRoleId == roleId && sq.SetTermId == termId && sq.Order == i).FirstOrDefault();
                    if (item != null) item.Order -= 1;
                    _context.SaveChanges();
                }
            }

            question.Order = newOrder;
            _context.SaveChanges();
            return NoContent();
        }

        // -- answers

        [HttpGet("{setId}/questions/{questionId}/answers")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<IEnumerable<SetQuestion>>> GetSetAnswers(int questionId)
        {
            var question = await _context.SetQuestions.FindAsync(questionId);
            if (question == null)
            {
                return NotFound("question not found");
            }
            var setAnswers = _context.SetAnswers
                .Where(sa => sa.SetQuestionId == questionId)
                .OrderByDescending(sa => sa.Rating)
                .ToList();
            return Ok(setAnswers);
        }

        [HttpGet("{setId}/questions/{questionId}/answers/{rating}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<IEnumerable<SetQuestion>>> GetSetAnswerInQuestion(int questionId, double rating)
        {
            var question = await _context.SetQuestions.FindAsync(questionId);
            if (question == null)
            {
                return NotFound("question not found");
            }
            var setAnswer = _context.SetAnswers
                .Where(sa => sa.SetQuestionId == questionId && sa.Rating == rating)
                .OrderByDescending(sa => sa.Rating)
                .SingleOrDefaultAsync();
            return Ok(setAnswer);
        }

        [HttpGet("{setId}/answers/{id}")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public async Task<ActionResult<SetAnswer>> GetSetAnswer(int id)
        {
            var answer = await _context.SetAnswers.FindAsync(id);
            if (answer == null)
            {
                return NotFound("answer not found");
            }
            return Ok(answer);
        }

        [HttpPost("{setId}/questions/{questionId}/answers")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetQuestion>> PostSetAnswer(int setId, int questionId, [FromBody] SetAnswerIM item)
        {
            var set = await _context.Sets.FindAsync(setId);
            if (set == null)
            {
                return NotFound("set not found");
            }

            var @question = await _context.SetQuestions.FindAsync(questionId);
            if (@question == null)
            {
                return NotFound("question not found");
            }

            var newAnswer = new SetAnswer
            {
                SetQuestionId = questionId,
                Text = item.Text,
                Description = item.Description,
                Rating = item.Rating,
                Critical = item.Critical
            };
            _context.SetAnswers.Add(newAnswer);
            await _context.SaveChangesAsync();
            return Ok(newAnswer);
        }

        [HttpPut("{setId}/answers/{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<SetTerm>> PutSetAnswer(int id, [FromBody] SetAnswer sa)
        {
            var @answer = await _context.SetAnswers.FindAsync(id);
            if (@answer == null)
            {
                return NotFound("answer not found");
            }
            answer.Text = sa.Text;
            answer.Description = sa.Description;
            answer.Critical = sa.Critical;
            answer.Rating = sa.Rating;
            await _context.SaveChangesAsync();
            return Ok(answer);
        }

        [HttpDelete("{setId}/answers/{id}")]
        [Authorize(Policy = "Administrator")]
        public async Task<ActionResult<IEnumerable<SetQuestion>>> DeleteSetAnswer(int id)
        {
            var answer = await _context.SetAnswers.FindAsync(id);
            if (answer != null)
            {
                _context.SetAnswers.Remove(answer);
                await _context.SaveChangesAsync();
                return Ok(answer);
            }
            return NotFound("answer not found");
        }
    }
}
