using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class WorkGoal
    {
        [Key]
        public int Id { get; set; }
        public int WorkId { get; set; }
        [ForeignKey("WorkId")]
        [JsonIgnore]
        public Work Work { get; set; }
        public int Order { get; set; }
        [Required]
        public string Text { get; set; }
    }
}
