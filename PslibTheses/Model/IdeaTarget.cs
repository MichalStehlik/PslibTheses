using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class IdeaTarget
    {
        [Key]
        public int Id { get; set; }
        public int IdeaId { get; set; }
        public Idea Idea { get; set; }
        public int TargetId { get; set; }
        public Target Target { get; set; }
    }
}
