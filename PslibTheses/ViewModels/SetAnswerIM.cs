using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.ViewModels
{
    public class SetAnswerIM
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string Description { get; set; }
        public int Rating { get; set; }
        public bool Critical { get; set; }
    }
}
