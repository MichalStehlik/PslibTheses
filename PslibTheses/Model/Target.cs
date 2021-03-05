using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class Target
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Text { get; set; }
        [NotMapped]
        public Color Color { get; set; }
        public ICollection<IdeaTarget> Ideas { get; } = new List<IdeaTarget>();
        public Int32 RGB { get { return Color.ToArgb(); } set { Color = Color.FromArgb(value); } }

    }
}
