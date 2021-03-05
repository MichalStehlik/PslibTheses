using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class Set
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [ForeignKey("ScaleId")]
        public Scale Scale { get; set; }
        [Required]
        public int ScaleId { get; set; }
        [Required]
        public bool Active { get; set; } = true;
        [Required]
        public int Year { get; set; }
        [Required]
        public ApplicationTemplate Template { get; set; } = ApplicationTemplate.GraduationWork;
        [JsonIgnore]
        public ICollection<SetTerm> Terms { get; set; }
        [JsonIgnore]
        public ICollection<SetRole> Roles { get; set; }
        [JsonIgnore]
        public ICollection<Work> Works { get; set; }
        public int RequiredGoals { get; set; } = 3;
        public int RequiredOutlines { get; set; } = 5;

    }
}
