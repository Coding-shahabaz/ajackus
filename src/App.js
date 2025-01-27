import React, { Component } from "react";
import axios from "axios";
import "./App.css";

class App extends Component {
  state = {
    users: [],
    currentUser: null,
    error: null,
    isEditing: false,
    currentPage: 1,
    usersPerPage: 5, 
  };

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/users"
      );
      this.setState({ users: response.data });
    } catch (error) {
      this.setState({
        error: "Failed to fetch users. Please try again later.",
      });
    }
  };

  handleAddUser = async (user) => {
    try {
      const response = await axios.post(
        "https://jsonplaceholder.typicode.com/users",
        user
      );
      this.setState((prevState) => ({
        users: [...prevState.users, { ...user, id: response.data.id }],
      }));
    } catch (error) {
      this.setState({ error: "Failed to add user. Please try again." });
    }
  };

  handleEditUser = async (user) => {
    try {
      await axios.put(
        `https://jsonplaceholder.typicode.com/users/${user.id}`,
        user
      );
      this.setState((prevState) => ({
        users: prevState.users.map((u) => (u.id === user.id ? user : u)),
        isEditing: false,
        currentUser: null,
      }));
    } catch (error) {
      this.setState({ error: "Failed to edit user. Please try again." });
    }
  };

  handleDeleteUser = async (id) => {
    try {
      await axios.delete(`https://jsonplaceholder.typicode.com/users/${id}`);
      this.setState((prevState) => ({
        users: prevState.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      this.setState({ error: "Failed to delete user. Please try again." });
    }
  };

  handleEditClick = (user) => {
    this.setState({ currentUser: user, isEditing: true });
  };

  handleFormSubmit = (user) => {
    if (this.state.isEditing) {
      this.handleEditUser(user);
    } else {
      this.handleAddUser(user);
    }
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  render() {
    const {
      users,
      currentUser,
      error,
      isEditing,
      currentPage,
      usersPerPage,
    } = this.state;

    // Calculate users for the current page
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(users.length / usersPerPage);

    return (
      <div className="container mt-5">
        <h1 className="text-center text-primary">User Management</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <UserForm
          onSubmit={this.handleFormSubmit}
          currentUser={currentUser}
          isEditing={isEditing}
        />
        <UserList
          users={currentUsers}
          onEdit={this.handleEditClick}
          onDelete={this.handleDeleteUser}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={this.handlePageChange}
        />
      </div>
    );
  }
}

const UserList = ({ users, onEdit, onDelete }) => (
  <table className="table table-striped table-bordered mt-4">
    <thead className="thead-dark">
      <tr>
        <th>ID</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th>Department</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr key={user.id}>
          <td>{user.id}</td>
          <td>{user.name.split(" ")[0]}</td>
          <td>{user.name.split(" ")[1] || ""}</td>
          <td>{user.email}</td>
          <td>{user.company.name}</td>
          <td>
            <button
              className="btn btn-warning btn-sm me-2"
              onClick={() => onEdit(user)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(user.id)}
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

class UserForm extends Component {
  state = {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    department: "",
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentUser && this.props.currentUser !== prevProps.currentUser) {
      const { id, name, email, company } = this.props.currentUser;
      this.setState({
        id,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1] || "",
        email,
        department: company.name,
      });
    }
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { id, firstName, lastName, email, department } = this.state;
    const user = {
      id,
      name: `${firstName} ${lastName}`,
      email,
      company: { name: department },
    };
    this.props.onSubmit(user);
    this.setState({ id: "", firstName: "", lastName: "", email: "", department: "" });
  };

  render() {
    const { firstName, lastName, email, department } = this.state;
    const { isEditing } = this.props;

    return (
      <form className="mt-4" onSubmit={this.handleSubmit}>
        <div className="row">
          <div className="col-md-3 mb-3">
            <input
              type="text"
              name="firstName"
              className="form-control"
              placeholder="First Name"
              value={firstName}
              onChange={this.handleChange}
              required
            />
          </div>
          <div className="col-md-3 mb-3">
            <input
              type="text"
              name="lastName"
              className="form-control"
              placeholder="Last Name"
              value={lastName}
              onChange={this.handleChange}
              required
            />
          </div>
          <div className="col-md-3 mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={this.handleChange}
              required
            />
          </div>
          <div className="col-md-3 mb-3">
            <input
              type="text"
              name="department"
              className="form-control"
              placeholder="Department"
              value={department}
              onChange={this.handleChange}
              required
            />
          </div>
        </div>
        <button className="btn btn-primary">
          {isEditing ? "Update" : "Add"} User
        </button>
      </form>
    );
  }
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <nav>
    <ul className="pagination justify-content-center mt-4">
      {[...Array(totalPages).keys()].map((page) => (
        <li
          key={page}
          className={`page-item ${page + 1 === currentPage ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => onPageChange(page + 1)}>
            {page + 1}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default App;
