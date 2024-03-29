﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PslibTheses.Model
{
    public class WorkRole
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int WorkId { get; set; }
        [ForeignKey("WorkId")]
        [JsonIgnore]
        public Work Work { get; set; }
        [Required]
        public int SetRoleId { get; set; }
        [ForeignKey("SetRoleId")]
        public SetRole SetRole { get; set; }
        public string Mark { get; set; } // legacy
        public double? MarkValue { get; set; } // numeric representation of mark
        public string MarkText { get; set; } // string representation of mark, not referenced using foreign key by design
        public bool Finalized { get; set; } = false;
        public string Review { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime Updated { get; set; }
        public ICollection<WorkRoleUser> WorkRoleUsers { get; set; }
        public ICollection<WorkRoleQuestion> WorkRoleQuestions { get; set; }
    }
}