using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.ViewModels
{
    public class WorkRoleReviewVM
    {
        public int WorkId { get; set; }
        public int WorkRoleId { get; set; }
        public int SetRoleId { get; set; }
        public string MarkText { get; set; }
        public double? MarkValue { get; set; }
        public bool Finalized { get; set; } = false;
        public string Review { get; set; }
        public DateTime Updated { get; set; }
    }
}
