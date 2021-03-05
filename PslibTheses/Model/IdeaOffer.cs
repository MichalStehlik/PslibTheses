using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class IdeaOffer
    {
        public int IdeaId { get; set; }
        public Idea Idea { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
    }
}
