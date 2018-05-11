﻿// <copyright>
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
using Newtonsoft.Json;

namespace Rock.Checkr.CheckrApi
{
    /// <summary>
    /// JSON return structure for the Create Candidate API Call's Response
    /// </summary>
    internal class GetDocumentResponse
    {
        /// <summary>
        /// Gets or sets the document ID.
        /// </summary>
        /// <value>
        /// The document ID.
        /// </value>
        [JsonProperty( "id" )]
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the download Uri.
        /// </summary>
        /// <value>
        /// The download Uri.
        /// </value>
        [JsonProperty( "download_uri" )]
        public string DownloadUri { get; set; }

        /// <summary>
        /// Gets or sets the filename.
        /// </summary>
        /// <value>
        /// The filename.
        /// </value>
        [JsonProperty( "filename" )]
        public string FileName { get; set; }
    }
}