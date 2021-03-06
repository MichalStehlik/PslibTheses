using System;
using System.ComponentModel.DataAnnotations;

namespace PslibTheses.ViewModels
{
    public class WorkBaseIM
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public string Resources { get; set; }
        public string Subject { get; set; }
        [Required]
        public Guid UserId { get; set; }
        public Guid AuthorId { get; set; }
        public Guid ManagerId { get; set; }
        [Required]
        public int SetId { get; set; }
        public string ClassName { get; set; }
        public string RepositoryURL { get; set; }
    }
}
