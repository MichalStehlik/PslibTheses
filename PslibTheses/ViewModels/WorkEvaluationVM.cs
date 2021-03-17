using PslibTheses.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.ViewModels
{
    public class WorkEvaluationListVM
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Guid AuthorId { get; set; }
        public string AuthorFirstName { get; set; }
        public string AuthorLastName { get; set; }
        public string ManagerFirstName { get; set; }
        public string ManagerLastName { get; set; }
        public Guid ManagerId { get; set; }
        public int SetId { get; set; }
        public string ClassName { get; set; }
        public WorkState State { get; set; }
    }
}
