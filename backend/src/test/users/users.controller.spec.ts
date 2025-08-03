import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { UsersController } from "../../modules/users/users.controller";
import { GetUserProfileUseCase } from "../../application/users/get-user-profile.use-case";
import { UpdateUserProfileUseCase } from "../../application/users/update-user-profile.use-case";
import { GetUserAddressesUseCase } from "../../application/users/get-user-addresses.use-case";
import { CreateUserAddressUseCase } from "../../application/users/create-user-address.use-case";
import { UpdateUserAddressUseCase } from "../../application/users/update-user-address.use-case";
import { DeleteUserAddressUseCase } from "../../application/users/delete-user-address.use-case";
import { SetDefaultAddressUseCase } from "../../application/users/set-default-address.use-case";
import { User, UserAddress, AddressType } from "../../domain/users/user.entity";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import { AuthGuard } from "../../common/auth/auth.guard";
import { createMockConfigService, MockAuthGuard } from "../test-utils";

describe("UsersController", () => {
  let controller: UsersController;
  let getUserProfileUseCase: GetUserProfileUseCase;
  let updateUserProfileUseCase: UpdateUserProfileUseCase;
  let getUserAddressesUseCase: GetUserAddressesUseCase;
  let createUserAddressUseCase: CreateUserAddressUseCase;
  let updateUserAddressUseCase: UpdateUserAddressUseCase;
  let deleteUserAddressUseCase: DeleteUserAddressUseCase;
  let setDefaultAddressUseCase: SetDefaultAddressUseCase;

  const mockUser = new User(
    "123",
    "test@example.com",
    "John",
    "Doe",
    "+237123456789",
    "customer",
    true,
    new Date(),
    new Date(),
  );

  const mockAddress = new UserAddress(
    "addr-123",
    "123",
    AddressType.HOME,
    "John",
    "Doe",
    "+237123456789",
    "123 Main St",
    "Apt 4B",
    "Douala",
    "Littoral",
    "12345",
    "CM",
    true,
    new Date(),
    new Date(),
  );

  const mockAuthenticatedUser: AuthenticatedUser = {
    id: "123",
    email: "test@example.com",
    role: "customer",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: GetUserProfileUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserProfileUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUserAddressesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CreateUserAddressUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserAddressUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteUserAddressUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SetDefaultAddressUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ConfigService,
          useFactory: createMockConfigService,
        },
        {
          provide: 'UserRepositoryPort',
          useValue: {
            getUserById: jest.fn(),
            updateUser: jest.fn(),
            validateUserExists: jest.fn(),
            getUserAddresses: jest.fn(),
            getAddressById: jest.fn(),
            createAddress: jest.fn(),
            updateAddress: jest.fn(),
            deleteAddress: jest.fn(),
            setDefaultAddress: jest.fn(),
            getDefaultAddress: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useClass(MockAuthGuard)
    .compile();

    controller = module.get<UsersController>(UsersController);
    getUserProfileUseCase = module.get<GetUserProfileUseCase>(
      GetUserProfileUseCase,
    );
    updateUserProfileUseCase = module.get<UpdateUserProfileUseCase>(
      UpdateUserProfileUseCase,
    );
    getUserAddressesUseCase = module.get<GetUserAddressesUseCase>(
      GetUserAddressesUseCase,
    );
    createUserAddressUseCase = module.get<CreateUserAddressUseCase>(
      CreateUserAddressUseCase,
    );
    updateUserAddressUseCase = module.get<UpdateUserAddressUseCase>(
      UpdateUserAddressUseCase,
    );
    deleteUserAddressUseCase = module.get<DeleteUserAddressUseCase>(
      DeleteUserAddressUseCase,
    );
    setDefaultAddressUseCase = module.get<SetDefaultAddressUseCase>(
      SetDefaultAddressUseCase,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getCurrentUser", () => {
    it("should return user profile", async () => {
      jest.spyOn(getUserProfileUseCase, "execute").mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockAuthenticatedUser);

      expect(result).toEqual({
        success: true,
        data: mockUser,
      });
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith("123");
    });
  });

  describe("getUserAddresses", () => {
    it("should return user addresses", async () => {
      jest
        .spyOn(getUserAddressesUseCase, "execute")
        .mockResolvedValue([mockAddress]);

      const result = await controller.getUserAddresses(mockAuthenticatedUser);

      expect(result).toEqual({
        success: true,
        data: [mockAddress],
      });
      expect(getUserAddressesUseCase.execute).toHaveBeenCalledWith("123");
    });
  });

  describe("createAddress", () => {
    it("should create a new address", async () => {
      const createAddressDto = {
        type: AddressType.HOME,
        firstName: "John",
        lastName: "Doe",
        phone: "+237123456789",
        addressLine1: "123 Main St",
        city: "Douala",
        region: "Littoral",
        country: "CM",
      };

      jest
        .spyOn(createUserAddressUseCase, "execute")
        .mockResolvedValue(mockAddress);

      const result = await controller.createAddress(
        mockAuthenticatedUser,
        createAddressDto,
      );

      expect(result).toEqual({
        success: true,
        data: mockAddress,
      });
      expect(createUserAddressUseCase.execute).toHaveBeenCalledWith(
        "123",
        createAddressDto,
      );
    });
  });

  describe("setDefaultAddress", () => {
    it("should set default address", async () => {
      jest.spyOn(setDefaultAddressUseCase, "execute").mockResolvedValue();

      const result = await controller.setDefaultAddress(
        mockAuthenticatedUser,
        "addr-123",
      );

      expect(result).toEqual({
        success: true,
        message: "Default address updated successfully",
      });
      expect(setDefaultAddressUseCase.execute).toHaveBeenCalledWith(
        "addr-123",
        "123",
      );
    });
  });
});
