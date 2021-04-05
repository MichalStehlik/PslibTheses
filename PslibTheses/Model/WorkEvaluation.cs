using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    // record for answer to question defined by set in some role and term
    [Table("WorkEvaluations")]
    public class WorkEvaluation
    {
        [Required]
        public int WorkId { get; set; }
        [JsonIgnore]
        public Work Work { get; set; }
        [Required]
        public int SetQuestionId { get; set; }
        [JsonIgnore]
        public SetQuestion SetQuestion { get; set; }
        [Required]
        public int SetAnswerId { get; set; }
        public SetAnswer SetAnswer { get; set; }
        [NotMapped]
        public int Points { get { if (SetQuestion != null && SetAnswer != null) return SetQuestion.Points * SetAnswer.Rating / 100; else return 0; } }
        [Required]
        public Guid CreatedById { get; set; }
        [JsonIgnore]
        [ForeignKey("CreatedById")]
        public User CreatedBy { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime Created { get; set; }
    }
}
