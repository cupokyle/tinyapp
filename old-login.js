// <% if(!user){ %>
//   <form method="POST" class="form-inline" action="/login">
//     <div class="form-group">
//       <label class="text-white ml-5 mr-2">Log in:</label>
//       <input type="text" name="username" placeholder="username">
//       <button class="btn btn-info ml-3">Submit</button>
//     </div>
//   </form>
//   <% } else { %>
//     <form method="POST" class="form-inline" action="/logout">
//     <div class="form-group">
//     <label class="text-white ml-5 mr-2">Logged in as <%= user.email %></label>
//     <button class="btn btn-info ml-3">Logout</button>
//     </div>
//   </form>
//  <% } %>