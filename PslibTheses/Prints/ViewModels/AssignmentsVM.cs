using PslibTheses.Model;
using System;
using System.Collections.Generic;

namespace PslibTheses.Prints.ViewModels
{
    public class AssignmentsVM
    {
        public ICollection<Work> Works { get; set; }
        public Dictionary<int, List<WorkRole>> Roles { get; set; }
        public Set Set { get; set; }
        public string AppUrl { get; set; }
        public DateTime Date { get; set; }
        public bool HasConsultantSignature { get; set; } = true;
        public bool HasDepartmentHeadSignature { get; set; } = true;
        public bool HasClassTeacherSignature { get; set; } = true;
        public bool HasGarantSignature { get; set; } = true;
        public bool HasDirectorSignature { get; set; } = true;
    }
}
