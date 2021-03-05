using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PslibTheses.Model
{
    public class SetQuestion
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int Order { get; set; }
        [Required]
        public string Text { get; set; }
        public string Description { get; set; }
        public int Points { get; set; }
        [ForeignKey("SetTermId")]
        [JsonIgnore]
        public SetTerm Term { get; set; }
        [Required]
        public int SetTermId { get; set; }
        [ForeignKey("SetRoleId")]
        [JsonIgnore]
        public SetRole Role { get; set; }
        [Required]
        public int SetRoleId { get; set; }
        [JsonIgnore]
        public ICollection<SetAnswer> Answers { get; set; }
    }
}