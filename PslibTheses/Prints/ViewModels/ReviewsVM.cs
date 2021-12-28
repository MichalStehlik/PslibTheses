using PslibTheses.Model;
using System;
using System.Collections.Generic;

namespace PslibTheses.Prints.ViewModels
{
    public class ReviewsVM
    {
        public ICollection<Work> Works { get; set; }
        public Dictionary<int, List<WorkRole>> Roles { get; set; }
        public string SetName { get; set; }
        public string AppUrl { get; set; }
        public DateTime Date { get; set; }
        public bool HasSummary { get; set; }
        public bool HasHistory { get; set; }
        public bool HasText { get; set; }
        public bool HasQuestions { get; set; }
    }
}
