using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class Work : IdeaFoundation
    {
        public Guid AuthorId { get; set; }
        [Required]
        [ForeignKey("AuthorId")]
        [JsonIgnore]
        public User Author { get; set; }
        public string ClassName { get; set; }
        public Guid ManagerId { get; set; }
        [Required]
        [ForeignKey("ManagerId")]
        [JsonIgnore]
        public User Manager { get; set; }
        public int SetId { get; set; }
        [Required]
        [ForeignKey("SetId")]
        [JsonIgnore]
        public Set Set { get; set; }
        public int MaterialCosts { get; set; } = 0;
        public int MaterialCostsProvidedBySchool { get; set; } = 0;
        public int ServicesCosts { get; set; } = 0;
        public int ServicesCostsProvidedBySchool { get; set; } = 0;
        public string DetailExpenditures { get; set; }
        public string RepositoryURL { get; set; }
        public WorkState State { get; set; } = WorkState.InPreparation;
        public ICollection<WorkGoal> Goals { get; } = new List<WorkGoal>();
        public ICollection<WorkOutline> Outlines { get; } = new List<WorkOutline>();
        public ICollection<WorkRole> Roles { get; } = new List<WorkRole>();
    }
}
