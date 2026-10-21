<%@ Page Language="C#" MasterPageFile="Site.Master" AutoEventWireup="true" Inherits="Rock.Web.UI.RockPage" %>

<asp:Content ID="ctMain" ContentPlaceHolderID="main" runat="server">

    <main class="container">

        <!-- Start Content Area -->

        <div class="row">
            <div class="col-md-12">
                <Rock:Zone Name="Feature" runat="server" />
            </div>
        </div>

        <div class="row">
            <div class="col-md-9">
                <Rock:Zone Name="Main" runat="server" />
            </div>
            <div class="col-md-3">
                <Rock:Zone Name="Sidebar 1" runat="server" />
            </div>
        </div>

        <!-- End Content Area -->

    </main>

</asp:Content>
