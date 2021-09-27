using PslibTheses.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Prints.ViewModels
{
    public class ReviewVM
    {
        public string AuthorName { get; set; }
        public string ClassName { get; set; }
        public string Title { get; set; }
        public string SetName { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string AppUrl { get; set; }
        public DateTime Date { get; set; }
        public bool HasSummary { get; set; }
        public bool HasHistory { get; set; }
        public bool HasText { get; set; }
        public bool HasQuestions { get; set; }
        public ICollection<WorkRole> Roles { get; set; }
    }
}
