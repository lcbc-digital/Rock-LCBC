﻿<%@ Control Language="C#" AutoEventWireup="true" CodeFile="CaptivePortal.ascx.cs" Inherits="RockWeb.Blocks.Core.CaptivePortal" %>

<asp:UpdatePanel ID="upnlContent" runat="server">
    <ContentTemplate>
        <Rock:NotificationBox ID="nbAlert" runat="server" NotificationBoxType="Danger" />
        <asp:ValidationSummary ID="valCaptivePortal" runat="server" HeaderText="Please Correct the Following" CssClass="alert alert-danger" ValidationGroup="CaptivePortal" />
        <asp:Panel ID="pnlDetails" CssClass="panel panel-block" runat="server">
            <div class="panel-heading">
                <h1 class="panel-title"><i class="fa fa-wifi"></i> Wifi Welcome</h1>
            </div>
            <div class="panel-body">
                
                <div class="row">
                    <div class="col-md-10">
                        <Rock:RockTextBox ID="tbFirstName" runat="server" Required="false" Label="First Name" ValidationGroup="CaptivePortal" />
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-10">
                        <Rock:RockTextBox ID="tbLastName" runat="server" Required="false" Label="Last Name" ValidationGroup="CaptivePortal" />
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-10">
                        <Rock:RockTextBox ID="tbMobilePhone" runat="server" Required="false" Label="Mobile Number" ValidationGroup="CaptivePortal" />
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-10">
                        <Rock:RockTextBox ID="tbEmail" runat="server" Required="false" Label="Email Address" ValidationGroup="CaptivePortal" />
                    </div>
                </div>

                <%-- box here to display T&C --%>
                <div class="row">
                    <div class="col-md-10">
                        <iframe id="iframeLegalNotice" runat="server" style="width: 100%; height: 400px; background-color: #fff;"></iframe>
                    </div>
                </div>
                
                <%-- Checkbox here to indicate agreement with T&C --%>
                <div class="row" >
                    <div class="col-md-10" style="display: inline-block;">
                        <Rock:RockCheckBox ID="cbAcceptTAC" runat="server" Text="I Accept" ValidationGroup="CaptivePortal" />
                    </div>
                </div>

                <%-- Button here to connect --%>
                <div class="actions row">
                    <div class="col-md-10">
                        <asp:LinkButton ID="btnConnect" runat="server" Text="Connect To WiFi" CssClass="btn btn-primary" OnClick="btnConnect_Click" style="width:100%;" ValidationGroup="CaptivePortal" />
                    </div>
                </div>
            </div>
    
    
    
    
        </asp:Panel>
    
    </ContentTemplate>
</asp:UpdatePanel>