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
    /// Base client model for GroupSync that only includes the non-virtual fields. Use this for PUT/POSTs
    /// </summary>
    public partial class GroupSyncEntity
    {
        /// <summary />
        public int Id { get; set; }

        /// <summary />
        public bool AddUserAccountsDuringSync { get; set; }

        /// <summary />
        public int? ExitSystemCommunicationId { get; set; }

        /// <summary />
        // Made Obsolete in Rock "1.10"
        [Obsolete( "Use ExitSystemCommunicationId instead.", false )]
        public int? ExitSystemEmailId { get; set; }

        /// <summary />
        public Guid? ForeignGuid { get; set; }

        /// <summary />
        public string ForeignKey { get; set; }

        /// <summary />
        public int GroupId { get; set; }

        /// <summary />
        public int GroupTypeRoleId { get; set; }

        /// <summary />
        public DateTime? LastRefreshDateTime { get; set; }

        /// <summary>
        /// If the ModifiedByPersonAliasId is being set manually and should not be overwritten with current user when saved, set this value to true
        /// </summary>
        public bool ModifiedAuditValuesAlreadyUpdated { get; set; }

        /// <summary />
        public int? ScheduleIntervalMinutes { get; set; }

        /// <summary />
        public int SyncDataViewId { get; set; }

        /// <summary />
        public int? WelcomeSystemCommunicationId { get; set; }

        /// <summary />
        // Made Obsolete in Rock "1.10"
        [Obsolete( "Use WelcomeSystemCommunicationId instead.", false )]
        public int? WelcomeSystemEmailId { get; set; }

        /// <summary>
        /// Leave this as NULL to let Rock set this
        /// </summary>
        public DateTime? CreatedDateTime { get; set; }

        /// <summary>
        /// This does not need to be set or changed. Rock will always set this to the current date/time when saved to the database.
        /// </summary>
        public DateTime? ModifiedDateTime { get; set; }

        /// <summary>
        /// Leave this as NULL to let Rock set this
        /// </summary>
        public int? CreatedByPersonAliasId { get; set; }

        /// <summary>
        /// If you need to set this manually, set ModifiedAuditValuesAlreadyUpdated=True to prevent Rock from setting it
        /// </summary>
        public int? ModifiedByPersonAliasId { get; set; }

        /// <summary />
        public Guid Guid { get; set; }

        /// <summary />
        public int? ForeignId { get; set; }

        /// <summary>
        /// Copies the base properties from a source GroupSync object
        /// </summary>
        /// <param name="source">The source.</param>
        public void CopyPropertiesFrom( GroupSync source )
        {
            this.Id = source.Id;
            this.AddUserAccountsDuringSync = source.AddUserAccountsDuringSync;
            this.ExitSystemCommunicationId = source.ExitSystemCommunicationId;
            #pragma warning disable 612, 618
            this.ExitSystemEmailId = source.ExitSystemEmailId;
            #pragma warning restore 612, 618
            this.ForeignGuid = source.ForeignGuid;
            this.ForeignKey = source.ForeignKey;
            this.GroupId = source.GroupId;
            this.GroupTypeRoleId = source.GroupTypeRoleId;
            this.LastRefreshDateTime = source.LastRefreshDateTime;
            this.ModifiedAuditValuesAlreadyUpdated = source.ModifiedAuditValuesAlreadyUpdated;
            this.ScheduleIntervalMinutes = source.ScheduleIntervalMinutes;
            this.SyncDataViewId = source.SyncDataViewId;
            this.WelcomeSystemCommunicationId = source.WelcomeSystemCommunicationId;
            #pragma warning disable 612, 618
            this.WelcomeSystemEmailId = source.WelcomeSystemEmailId;
            #pragma warning restore 612, 618
            this.CreatedDateTime = source.CreatedDateTime;
            this.ModifiedDateTime = source.ModifiedDateTime;
            this.CreatedByPersonAliasId = source.CreatedByPersonAliasId;
            this.ModifiedByPersonAliasId = source.ModifiedByPersonAliasId;
            this.Guid = source.Guid;
            this.ForeignId = source.ForeignId;

        }
    }

    /// <summary>
    /// Client model for GroupSync that includes all the fields that are available for GETs. Use this for GETs (use GroupSyncEntity for POST/PUTs)
    /// </summary>
    public partial class GroupSync : GroupSyncEntity
    {
        /// <summary />
        public SystemCommunication ExitSystemCommunication { get; set; }

        /// <summary />
        public Group Group { get; set; }

        /// <summary />
        public GroupTypeRole GroupTypeRole { get; set; }

        /// <summary />
        public DataView SyncDataView { get; set; }

        /// <summary />
        public SystemCommunication WelcomeSystemCommunication { get; set; }

        /// <summary>
        /// NOTE: Attributes are only populated when ?loadAttributes is specified. Options for loadAttributes are true, false, 'simple', 'expanded' 
        /// </summary>
        public Dictionary<string, Rock.Client.Attribute> Attributes { get; set; }

        /// <summary>
        /// NOTE: AttributeValues are only populated when ?loadAttributes is specified. Options for loadAttributes are true, false, 'simple', 'expanded' 
        /// </summary>
        public Dictionary<string, Rock.Client.AttributeValue> AttributeValues { get; set; }
    }
}
