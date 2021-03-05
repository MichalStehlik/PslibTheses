using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class IdeaGoal
    {
        [Key]
        public int Id { get; set; }
        public int IdeaId { get; set; }
        [ForeignKey("IdeaId")]
        public Idea Idea { get; set; }
        public int Order { get; set; }
        [Required]
        public string Text { get; set; }
    }
}
