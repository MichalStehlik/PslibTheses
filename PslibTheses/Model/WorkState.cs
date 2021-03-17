using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public enum WorkState
    {
        InPreparation = 0,
        WorkedOut = 1,
        Failed = 2,
        Delivered = 3,
        Evaluated = 4,
        Successful = 5,
        Unsuccessful = 6
    }
}
