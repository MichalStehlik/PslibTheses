using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class Scale
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [JsonIgnore]
        public ICollection<Set> Sets { get; set; }
        public ICollection<ScaleValue> ScaleValues { get; set; }
    }
}
