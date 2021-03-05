using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class ScaleValue
    {
        [ForeignKey("ScaleId")]
        [JsonIgnore]
        public Scale Scale { get; set; }
        [Key]
        public int ScaleId { get; set; }
        [Key]
        public double Rate { get; set; }
        [Required]
        public double Mark { get; set; }
        [Required]
        public string Name { get; set; }
    }
}
