using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    abstract public class IdeaFoundation
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public string Resources { get; set; }
        public string Subject { get; set; }
        public Guid UserId { get; set; }
        [Required]
        [ForeignKey("UserId")]
        public User User { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime Created { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime Updated { get; set; }
        [Timestamp]
        public byte[] RowVersion { get; set; }
    }
}
