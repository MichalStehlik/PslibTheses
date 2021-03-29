using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.ViewModels
{
    public class WorkAnswerIM
    {
        [Required]
        public int WorkId { get; set; }
        [Required]
        public int QuestionId { get; set; }
        [Required]
        public int AnswerId { get; set; }
    }
}
