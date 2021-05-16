using System;

namespace PslibTheses.ViewModels
{
    public class WorkRoleMarkIM
    {
        public int WorkId { get; set; }
        public int WorkRoleId { get; set; }
        public string MarkText { get; set; }
        public double? MarkValue { get; set; }
        public bool Finalized { get; set; } = false;
        public DateTime Updated { get; set; }
    }
}
