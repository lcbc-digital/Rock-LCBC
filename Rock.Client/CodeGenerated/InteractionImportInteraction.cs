//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by the Rock.CodeGeneration project
//     Changes to this file will be lost when the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------
// <copyright>
// Copyright by the Spark Development Network
//
// Licensed under the Rock Community License (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.rockrms.com/license
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>
//
using System;
using System.Collections.Generic;


namespace Rock.Client
{
    /// <summary>
    /// Used for the POST to ~/api/Interactions/Import
    /// </summary>
    public partial class InteractionImportInteractionEntity
    {
        /// <summary />
        public string Campaign { get; set; }

        /// <summary />
        public string ChannelCustom1 { get; set; }

        /// <summary />
        public string ChannelCustom2 { get; set; }

        /// <summary />
        public string ChannelCustomIndexed1 { get; set; }

        /// <summary />
        public string Content { get; set; }

        /// <summary />
        public int? EntityId { get; set; }

        /// <summary />
        public string ForeignKey { get; set; }

        /// <summary />
        public string InteractionData { get; set; }

        /// <summary />
        public DateTime InteractionDateTime { get; set; }

        /// <summary />
        public DateTime? InteractionEndDateTime { get; set; }

        /// <summary />
        public double? InteractionLength { get; set; }

        /// <summary />
        public string InteractionSummary { get; set; }

        /// <summary />
        public double? InteractionTimeToServe { get; set; }

        /// <summary />
        public string Medium { get; set; }

        /// <summary />
        public string Operation { get; set; }

        /// <summary />
        public int? PersonalDeviceId { get; set; }

        /// <summary />
        public int? PersonAliasId { get; set; }

        /// <summary />
        public int? RelatedEntityId { get; set; }

        /// <summary />
        public int? RelatedEntityTypeId { get; set; }

        /// <summary />
        public string Source { get; set; }

        /// <summary />
        public string Term { get; set; }

        /// <summary />
        public int? ForeignId { get; set; }

        /// <summary>
        /// Copies the base properties from a source InteractionImportInteraction object
        /// </summary>
        /// <param name="source">The source.</param>
        public void CopyPropertiesFrom( InteractionImportInteraction source )
        {
            this.Campaign = source.Campaign;
            this.ChannelCustom1 = source.ChannelCustom1;
            this.ChannelCustom2 = source.ChannelCustom2;
            this.ChannelCustomIndexed1 = source.ChannelCustomIndexed1;
            this.Content = source.Content;
            this.EntityId = source.EntityId;
            this.ForeignKey = source.ForeignKey;
            this.InteractionData = source.InteractionData;
            this.InteractionDateTime = source.InteractionDateTime;
            this.InteractionEndDateTime = source.InteractionEndDateTime;
            this.InteractionLength = source.InteractionLength;
            this.InteractionSummary = source.InteractionSummary;
            this.InteractionTimeToServe = source.InteractionTimeToServe;
            this.Medium = source.Medium;
            this.Operation = source.Operation;
            this.PersonalDeviceId = source.PersonalDeviceId;
            this.PersonAliasId = source.PersonAliasId;
            this.RelatedEntityId = source.RelatedEntityId;
            this.RelatedEntityTypeId = source.RelatedEntityTypeId;
            this.Source = source.Source;
            this.Term = source.Term;
            this.ForeignId = source.ForeignId;

        }
    }

    /// <summary>
    /// Used for the POST to ~/api/Interactions/Import
    /// </summary>
    public partial class InteractionImportInteraction : InteractionImportInteractionEntity
    {
    }
}
