﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.ViewModels
{
    public class WorkVM
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public string Resources { get; set; }
        public string Subject { get; set; }
        [Required]
        public Guid UserId { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
    }
}
