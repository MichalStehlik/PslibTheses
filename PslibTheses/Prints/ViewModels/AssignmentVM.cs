using PslibTheses.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Prints.ViewModels
{
    public class AssignmentVM
    {
        public string AuthorName { get; set; }
        public string ClassName { get; set; }
        public string Title { get; set; }
        public string SetName { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string Resources { get; set; }
        public string AppUrl { get; set; }
        public bool HasConsultantSignature { get; set; } = true;
        public bool HasDepartmentHeadSignature { get; set; } = true;
        public bool HasClassTeacherSignature { get; set; } = true;
        public bool HasGarantSignature { get; set; } = true;
        public bool HasDirectorSignature { get; set; } = true;
        public DateTime Date { get; set; }
        public int MaterialCosts { get; set; } = 0; 
        public int MaterialCostsProvidedBySchool { get; set; } = 0;
        public int ServicesCosts { get; set; } = 0;
        public int ServicesCostsProvidedBySchool { get; set; } = 0;
        public ICollection<WorkRole> Roles { get; set; }
        public ICollection<WorkGoal> Goals { get; set; }
        public ICollection<WorkOutline> Outlines { get; set; }
    }
}
