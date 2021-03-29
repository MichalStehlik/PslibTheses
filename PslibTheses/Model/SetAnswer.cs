using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class SetAnswer
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Text { get; set; }
        public string Description { get; set; }
        [Required]
        public int Rating { get; set; }
        public bool Critical { get; set; }
        [ForeignKey("SetQuestionId")]
        [JsonIgnore]
        public SetQuestion Question { get; set; }
        [Required]
        public int SetQuestionId { get; set; }
    }
}
