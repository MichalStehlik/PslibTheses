using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    // record for answer to question defined by set in some role and term
    [Table("WorkEvaluations")]
    public class WorkEvaluation
    {
        [Required]
        public int WorkId { get; set; }
        public Work Work { get; set; }
        [Required]
        public int SetQuestionId { get; set; }
        public SetQuestion SetQuestion { get; set; }
        [Required]
        public int SetAnswerId { get; set; }
        public SetAnswer SetAnswer { get; set; }
        [NotMapped]
        public int Points { get { return SetQuestion.Points * SetAnswer.Rating; } }
        [Required]
        public Guid CreatedById { get; set; }
        public User CreatedBy { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime Created { get; set; }
    }
}
