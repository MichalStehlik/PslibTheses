using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.ViewModels
{
    public class WorkRoleTermStatsVM
    {
        public int? TotalQuestions { get; set; }
        public int? FilledQuestions { get; set; }
        public int? TotalPoints { get; set; }
        public int? FilledPoints { get; set; }
        public int? GainedPoints { get; set; }
        public int? CriticalAnswers { get; set; }
        public string CalculatedMark { get; set; }
    }
}
