using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    [Table("WorkNotes")]
    public class WorkNote
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int WorkId { get; set; }
        public Work Work { get; set; }
        public Guid CreatedById { get; set; }
        public User CreatedBy { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime Created { get; set; }
        [Required]
        public string Text { get; set; }
    }
}
