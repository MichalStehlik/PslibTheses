using PslibTheses.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Prints.ViewModels
{
    public class IdeaPrintVM
    {
        public string AuthorName { get; set; }
        public string ClassName { get; set; }
        public string Title { get; set; }
        public string SetName { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string Resources { get; set; }
        public string AppUrl { get; set; }
        public DateTime Date { get; set; }
        public ICollection<IdeaGoal> Goals { get; set; }
        public ICollection<IdeaOutline> Outlines { get; set; }
    }
}
