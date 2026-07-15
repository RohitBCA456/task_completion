import { User } from "../models/user.model.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import { Op } from "sequelize";

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, address } = req.body;

    if (
      [username, email, password].some(
        (field) => !field || String(field).trim() === "",
      )
    ) {
      throw new ApiError(400, "Required fields are missing");
    }

    if (!email.includes("@")) {
      throw new ApiError(400, "Please enter a valid email");
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: email }],
      },
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "User already exists with this username or email",
      );
    }

    const createdUser = await User.create({
      username,
      email,
      password,
      address,
    });

    const userResponse = createdUser.toJSON();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res
      .status(201)
      .json(new ApiResponse(201, userResponse, "User registered successfully"));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await User.update(
      { refreshToken: refreshToken },
      { where: { id: user.id } },
    );

    const loggedInUser = user.toJSON();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken },
          "User logged in successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

const fetchUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, "user id parameter is missing");
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export { registerUser, login, fetchUser };
