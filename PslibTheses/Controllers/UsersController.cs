using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PslibTheses.Data;
using PslibTheses.Model;
using PslibTheses.ViewModels;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PslibTheses.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ThesesContext _context;
        private readonly ILogger<UsersController> _logger;
        private readonly IAuthorizationService _authorizationService;
        private readonly int iconSize = 64;

        public UsersController(ThesesContext context, ILogger<UsersController> logger, IAuthorizationService authorizationService)
        {
            _context = context;
            _logger = logger;
            _authorizationService = authorizationService;
        }

        // GET: /Users
        /// <summary>
        /// Gets list of users satisfying parameters.
        /// </summary>
        /// <param name="search">Firstname, lastname and email fields will be searched if this text is contained (even partially) within.</param>
        /// <param name="firstname">If FirstName of record contains this text, this record will be returned.</param>
        /// <param name="lastname">If LastName of record contains this text, this record will be returned.</param>
        /// <param name="email">If Email of record contains this text, this record will be returned.</param>
        /// <param name="author">If user can be author of work, this record will be returned.</param>
        /// <param name="evaluator">If user can be evaluator of works, this record will be returned.</param>
        /// <param name="order">Sorting order of result - valid values are: firstname, firstname_desc, lastname (default), lastname_desc, email, email_desc, id, id_desc</param>
        /// <param name="page">Index of currently returned page of result. Starts with 0, which is default value.</param>
        /// <param name="pagesize">Size of returned page. Default is 0. If 0, no paging is performed.</param>
        /// <returns>
        /// anonymous object: {
        /// total = amount of all users,
        /// filtered = number of records after filter was applied,
        /// count = number of records after filter and paging was applied,
        /// page = index of returned page,
        /// pages = count of pages for applied filter, returns 0 if no paging was requested,
        /// data = list of users
        /// }
        /// </returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers(
            string search = null,
            string firstname = null,
            string lastname = null,
            string email = null,
            Gender? gender = null,
            bool? author = null,
            bool? evaluator = null,
            string order = "lastname",
            int page = 0,
            int pagesize = 0)
        {
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            IQueryable<User> users = _context.Users;
            int total = users.CountAsync().Result;
            if (!String.IsNullOrEmpty(search))
                users = users.Where(u => (u.FirstName.Contains(search) || u.LastName.Contains(search) || u.Email.Contains(search)));
            if (!String.IsNullOrEmpty(firstname))
                users = users.Where(u => (u.FirstName.Contains(firstname)));
            if (!String.IsNullOrEmpty(lastname))
                users = users.Where(u => (u.LastName.Contains(lastname)));
            if (!String.IsNullOrEmpty(email))
                users = users.Where(u => (u.FirstName.Contains(email)));
            if (gender != null)
                users = users.Where(u => (u.Gender == gender));
            if (author != null)
                users = users.Where(u => (u.CanBeAuthor == author));
            if (evaluator != null)
                users = users.Where(u => (u.CanBeEvaluator == evaluator));
            int filtered = users.CountAsync().Result;
            users = order switch
            {
                "firstname" => users.OrderBy(u => u.FirstName),
                "firstname_desc" => users.OrderByDescending(u => u.FirstName),
                "lastname" => users.OrderBy(u => u.LastName),
                "lastname_desc" => users.OrderByDescending(u => u.LastName),
                "email" => users.OrderBy(u => u.Email),
                "email_desc" => users.OrderByDescending(u => u.Email),
                "id_desc" => users.OrderByDescending(u => u.Id),
                _ => users.OrderBy(u => u.Id),
            };
            if (!isEvaluator.Succeeded)
            {
                users = users.Select(u => new User { Id = u.Id, FirstName = u.FirstName, LastName = u.LastName, MiddleName = u.MiddleName, CanBeAuthor = u.CanBeAuthor, CanBeEvaluator = u.CanBeEvaluator });
            }
            if (pagesize != 0)
            {
                users = users.Skip(page * pagesize).Take(pagesize);
            }
            var result = users.ToList();
            int count = result.Count;
            return Ok(new { total, filtered, count, page, pages = ((pagesize == 0) ? 0 : Math.Ceiling((double)filtered / pagesize)), data = result });
        }

        // GET: /Users/aaa
        /// <summary>
        /// Gets data of one user specified by his Id
        /// </summary>
        /// <param name="id">User Id</param>
        /// <returns>User</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(Guid id)
        {
            var isEvaluator = await _authorizationService.AuthorizeAsync(User, "AdministratorOrManagerOrEvaluator");
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogError("user not found", id);
                return NotFound();
            }
            if (!isEvaluator.Succeeded)
            {
                user = new User { Id = user.Id, FirstName = user.FirstName, LastName = user.LastName, MiddleName = user.MiddleName, CanBeAuthor = user.CanBeAuthor, CanBeEvaluator = user.CanBeEvaluator };
            }
            return user;
        }

        // PUT: /Users/aaa
        /// <summary>
        /// Overwrites data of user specified by his Id
        /// </summary>
        /// <param name="id">User Id</param>
        /// <param name="user">New User data</param>
        /// <returns>HTTP 204,400,404</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(Guid id, User newUser)
        {
            if (id != newUser.Id)
            {
                _logger.LogError("user record is not consistent, so cannot be updated", id);
                return BadRequest("record inconsistent, provided ID is not correct");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogError("user not found", id);
                return NotFound("user not found");
            }

            var isAdmin = await _authorizationService.AuthorizeAsync(User, "Administrator");
            if (!User.HasClaim(ClaimTypes.NameIdentifier, user.Id.ToString())
                && !isAdmin.Succeeded)
            {
                return Unauthorized("only user himself or privileged user can edit user record");
            }

            if (!isAdmin.Succeeded && user.LockedChange == true)
            {
                return BadRequest("record is locked for change");
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                user.FirstName = newUser.FirstName;
                user.MiddleName = newUser.MiddleName;
                user.LastName = newUser.LastName;
                user.Gender = newUser.Gender;
                user.LockedChange = newUser.LockedChange;
                user.LockedIcon = newUser.LockedIcon;
                user.CanBeAuthor = newUser.CanBeAuthor;
                user.CanBeEvaluator = newUser.CanBeEvaluator;
                user.Email = newUser.Email;
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    _logger.LogError("storing of updated user has failed", user);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("storing of updated user has failed", ex, user);
                throw;
            }
            _logger.LogInformation("new user data stored", user);
            return NoContent();
        }

        // POST: /Users
        /// <summary>
        /// Creates and stores a new user, unless user with this Id already exists
        /// </summary>
        /// <param name="user">User data</param>
        /// <returns>HTTP 201, 200, 400</returns>
        [HttpPost]
        public async Task<ActionResult<User>> PostUser([FromBody] User user)
        {
            var existingUser = await _context.Users.FindAsync(user.Id);
            if (existingUser == null)
            {
                try
                {
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("new user created", user);
                    return CreatedAtAction("GetUser", new { id = user.Id }, user);
                }
                catch (Exception ex)
                {
                    _logger.LogError("storing of new user has failed", ex, user);
                    throw;
                }
            }
            else
            {
                _logger.LogInformation("existing user used", user);
                return Ok(existingUser);
            }
        }

        // DELETE: /Users/aaa
        /// <summary>
        /// Deletes one user specified by his Id
        /// </summary>
        /// <param name="id">User Id</param>
        /// <returns>User data if success, HTTP 404 if not found</returns>
        [Authorize(Policy = "Administrator")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<User>> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogError("user not found, so cannot be deleted", id);
                return NotFound();
            }
            try
            {
                _context.Users.Remove(user);
                _logger.LogInformation("user deleted", user);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("deleting of user has failed", ex, user);
                throw;
            }

            return user;
        }

        // GET: /Users/aaa/lockedChange
        /// <summary>
        /// Gets state of lock of user specified by his Id
        /// </summary>
        /// <param name="id">User Id</param>
        /// <returns>User</returns>
        [Authorize(Policy = "Administrator")]
        [HttpGet("{id}/locked-change")]
        public async Task<ActionResult<bool>> GetUserLockedChange(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogError("user not found", id);
                return NotFound();
            }
            return user.LockedChange;
        }

        // PUT: /Users/aaa/lockedChange
        /// <summary>
        /// Overwrites state of lock for user specified by his Id
        /// </summary>
        /// <param name="id">User Id</param>
        /// <param name="state">New state - bool</param>
        /// <returns>HTTP 204,400,404</returns>
        [Authorize(Policy = "Administrator")]
        [HttpPut("{id}/locked-change")]
        public async Task<IActionResult> PutUserLockedChange(Guid id, bool state)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogError("user not found, so cannot be updated", id);
                return BadRequest();
            }

            if (!User.HasClaim(Definitions.THESES_ADMIN_CLAIM, "1"))
            {
                return Unauthorized("only privileged user can edit user record");
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                user.LockedChange = state;
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    _logger.LogError("storing of user lock has failed", user);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("storing of user lock has failed", ex, user);
                throw;
            }
            _logger.LogInformation("state of user lock changed", user);
            return NoContent();
        }

        // GET: /Users/aaa/icon
        /// <summary>
        /// Gets content of user icon as file
        /// </summary>
        /// <param name="id">User Id</param>
        /// <returns>Stored file</returns>
        [HttpGet("{id}/icon")]
        public async Task<IActionResult> Icon(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                if (user.IconImage != null)
                {
                    return File(user.IconImage, user.IconImageType);
                }
                else
                {
                    return NoContent();
                }
            }
            else
            {
                return NotFound();
            }
        }

        // POST: /Users/aaa/icon
        [HttpPost("{id}/icon")]
        public async Task<IActionResult> UploadImage(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null && Request.Form.Files.Count == 1)
            {
                var file = Request.Form.Files[0];
                if (file != null && file.Length > 0)
                {
                    try
                    {
                        var size = file.Length;
                        var type = file.ContentType;
                        var filename = file.FileName;
                        Console.WriteLine("File:" + filename + " " + size + " " + type);
                        MemoryStream ims = new();
                        MemoryStream oms = new();
                        file.CopyTo(ims);

                        using (Image image = Image.Load(ims.ToArray(), out IImageFormat format))
                        {
                            int largestSize = Math.Max(image.Height, image.Width);
                            bool landscape = image.Width > image.Height;
                            if (landscape)
                                image.Mutate(x => x.Resize(0, iconSize));
                            else
                                image.Mutate(x => x.Resize(iconSize, 0));
                            image.Mutate(x => x.Crop(new Rectangle((image.Width - iconSize) / 2, (image.Height - iconSize) / 2, iconSize, iconSize)));
                            image.Save(oms, format);
                        }

                        user.IconImage = ims.ToArray();
                        user.IconImageType = type;
                        await _context.SaveChangesAsync();
                        return Ok();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("error saving icon", ex, ex.Message, user);
                        Console.WriteLine(ex.Message);
                        return BadRequest(ex.Message);
                    }
                }
                return BadRequest("file is empty or there is multiple files");
            }
            return BadRequest("there is no file in formData");
        }

        // Offers

        // GET: Ideas/xxx/offers
        /// <summary>
        /// Gets data of one idea specified by his Id, returns data from immediately associated tables.
        /// </summary>
        /// <param name="id">User Id</param>
        /// <returns>Idea</returns>
        [HttpGet("{id}/offers")]
        public async Task<ActionResult<List<IdeaVM>>> GetOfferedIdea(Guid id)
        {
            var ideas = await _context.IdeaOffers
                .Include(io => io.Idea)
                .Where(io => io.UserId == id)
                .OrderBy(io => io.Idea.Name)
                .Select(io => new {
                    io.Idea.Id,
                    io.Idea.Name
                })
                .ToListAsync();

            return Ok(ideas);
        }

        // POST: Ideas/xxx/offers
        /// <summary>
        /// Offers an idea to students
        /// </summary>
        /// <param name="id">Idea Id</param>
        /// <param name="userid">UserId in body of request</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpPost("{id}/offers")]
        [Authorize(Policy = "Evaluator")]
        public async Task<IActionResult> PostIdeaOffered(Guid id, [FromBody] UserOfferIM input)
        {
            var idea = await _context.Ideas.FindAsync(input.Id);
            var user = await _context.Users.FindAsync(id);

            _context.Entry(idea).State = EntityState.Modified;
            if (idea == null)
            {
                return NotFound("idea not found");
            }
            if (user == null)
            {
                return NotFound("user not found");
            }

            var ideaOffer = _context.IdeaOffers.Where(io => io.UserId == id && io.IdeaId == input.Id).FirstOrDefault();
            if (ideaOffer == null)
            {
                await _context.IdeaOffers.AddAsync(new IdeaOffer { IdeaId = input.Id, UserId = id });
                await _context.SaveChangesAsync();
                return NoContent();
            }
            else
            {
                return NoContent();
            }
        }

        // DELETE: Ideas/xxx/offers/4
        /// <summary>
        /// Removes selected offer
        /// </summary>
        /// <param name="id">User Id</param>
        /// <param name="ideaId">Idea Id</param>
        /// <returns>Removed goal, HTTP 404</returns>
        [HttpDelete("{id}/offers/{ideaId}")]
        [Authorize(Policy = "Evaluator")]
        public ActionResult<IdeaOffer> DeleteIdeaOffer(Guid id, int ideaId)
        {
            var ideaOffer = _context.IdeaOffers.Where(io => io.UserId == id && io.IdeaId == ideaId).FirstOrDefault();

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
        /// Removes all offers for an specified user clearing users list
        /// </summary>
        /// <param name="id">User id</param>
        /// <returns>HTTP 201, 404</returns>
        [HttpDelete("{id}/offers")]
        [Authorize(Policy = "AdministratorOrManagerOrEvaluator")]
        public ActionResult<IdeaGoal> DeleteAllIdeaOffers(Guid id)
        {
            var offers = _context.IdeaOffers.Where(io => io.UserId == id).AsNoTracking().ToList();
            if (offers != null)
            {
                _context.IdeaOffers.RemoveRange(offers);
                _context.SaveChanges();
            }
            return NoContent();
        }

        // -- works
        [HttpGet("{id}/works")]
        public async Task<ActionResult<List<WorkVM>>> GetWorks(Guid id)
        {
            var works = await _context.Works.Where(w => w.AuthorId == id).OrderBy(w => w.Name).ToListAsync();
            return Ok(works);
        }

        // -- ideas
        [HttpGet("{id}/ideas")]
        public async Task<ActionResult<List<IdeaVM>>> GetIdeas(Guid id)
        {
            var works = await _context.Ideas.Where(i => i.UserId == id).OrderBy(w => w.Name).ToListAsync();
            return Ok(works);
        }

        /// <summary>
        /// Check if user with Id exists.
        /// </summary>
        /// <param name="id">User Id</param>
        /// <returns>boolean</returns>
        private bool UserExists(Guid id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
