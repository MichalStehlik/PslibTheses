using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    // question asked by evaluators during presentation
    public class WorkRoleQuestion
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int WorkRoleId { get; set; }
        [JsonIgnore]
        public WorkRole WorkRole { get; set; }
        [Required]
        public Guid CreatedById { get; set; }
        public User CreatedBy { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime Created { get; set; }
        [Required]
        public string Text { get; set; }
    }
}
