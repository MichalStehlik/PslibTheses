using PslibTheses.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.ViewModels
{
    public class SetListVM
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Year { get; set; }
        public bool Active { get; set; }
        public ApplicationTemplate Template { get; set; }
        public int WorksCount { get; set; }
    }
}
