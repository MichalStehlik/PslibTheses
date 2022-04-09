using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class WorkRoleUser
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int WorkRoleId { get; set; }
        [ForeignKey("WorkRoleId")]
        [JsonIgnore]
        public WorkRole WorkRole { get; set; }
        [Required]
        public Guid UserId { get; set; }
        /*[JsonIgnore]*/
        [ForeignKey("UserId")]
        public User User { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime AssignedAt { get; set; }
    }
}
