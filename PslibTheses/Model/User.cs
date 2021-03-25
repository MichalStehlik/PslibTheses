using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public Gender Gender { get; set; }
        [Required]
        public string Email { get; set; }
        [DefaultValue(false)]
        public bool CanBeAuthor { get; set; } = false;
        [DefaultValue(false)]
        public bool CanBeEvaluator { get; set; } = false;
        public byte[] IconImage { get; set; }
        public string IconImageType { get; set; }
        public bool LockedChange { get; set; } = false;
        public bool LockedIcon { get; set; } = false;
        [NotMapped]
        public string Name { get { return LastName + ", " + FirstName + (String.IsNullOrEmpty(MiddleName) ? "" : (" " + MiddleName)); } }
        [JsonIgnore]
        public ICollection<Idea> OwnedIdeas { get; set; }
        [JsonIgnore]
        public ICollection<Idea> IdeaOffers { get; set; }
        [JsonIgnore]
        public ICollection<Work> OwnedWorks { get; set; }
        [JsonIgnore]
        public ICollection<Work> ManagedWorks { get; set; }
        [JsonIgnore]
        public ICollection<Work> AuthoredWorks { get; set; }
        [JsonIgnore]
        public ICollection<WorkRoleUser> WorkRoleUsers { get; set; }
    }
}
