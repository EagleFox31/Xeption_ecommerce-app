import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserRepositoryPort } from "../../../domain/users/user.port";
import {
  User,
  UserAddress,
  CreateAddressDto,
  UpdateAddressDto,
  UpdateUserDto,
  AddressType,
} from "../../../domain/users/user.entity";

@Injectable()
export class UserRepository implements UserRepositoryPort {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>("SUPABASE_URL"),
      this.configService.get<string>("SUPABASE_SERVICE_KEY"),
    );
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      // Get user from auth.users
      const { data: authUser, error: authError } =
        await this.supabase.auth.admin.getUserById(userId);

      if (authError || !authUser.user) {
        return null;
      }

      // Get additional profile data from public.users if exists
      const { data: profileData } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      const user = authUser.user;

      return new User(
        user.id,
        user.email,
        profileData?.first_name || user.user_metadata?.first_name,
        profileData?.last_name || user.user_metadata?.last_name,
        profileData?.phone || user.phone,
        profileData?.role || user.user_metadata?.role || "customer",
        user.email_confirmed_at !== null,
        new Date(user.created_at),
        new Date(user.updated_at),
        { ...user.user_metadata, ...profileData },
      );
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  async updateUser(userId: string, updates: UpdateUserDto): Promise<User> {
    try {
      // Update in public.users table
      const { data, error } = await this.supabase
        .from("users")
        .upsert({
          id: userId,
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.phone,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }

      // Return updated user
      return await this.getUserById(userId);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async validateUserExists(userId: string): Promise<boolean> {
    try {
      const { data, error } =
        await this.supabase.auth.admin.getUserById(userId);
      return !error && !!data.user;
    } catch (error) {
      return false;
    }
  }

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const { data, error } = await this.supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch addresses: ${error.message}`);
      }

      return (data || []).map(this.mapToUserAddress);
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      return [];
    }
  }

  async getAddressById(
    addressId: string,
    userId: string,
  ): Promise<UserAddress | null> {
    try {
      const { data, error } = await this.supabase
        .from("user_addresses")
        .select("*")
        .eq("id", addressId)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapToUserAddress(data);
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  }

  async createAddress(
    userId: string,
    addressData: CreateAddressDto,
  ): Promise<UserAddress> {
    try {
      // If this is set as default, unset other defaults first
      if (addressData.isDefault) {
        await this.unsetAllDefaultAddresses(userId);
      }

      const { data, error } = await this.supabase
        .from("user_addresses")
        .insert({
          user_id: userId,
          type: addressData.type,
          first_name: addressData.firstName,
          last_name: addressData.lastName,
          phone: addressData.phone,
          address_line_1: addressData.addressLine1,
          address_line_2: addressData.addressLine2,
          city: addressData.city,
          region: addressData.region,
          postal_code: addressData.postalCode,
          country: addressData.country || "CM",
          is_default: addressData.isDefault || false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create address: ${error.message}`);
      }

      return this.mapToUserAddress(data);
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  async updateAddress(
    addressId: string,
    userId: string,
    updates: UpdateAddressDto,
  ): Promise<UserAddress> {
    try {
      // If this is set as default, unset other defaults first
      if (updates.isDefault) {
        await this.unsetAllDefaultAddresses(userId);
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.firstName !== undefined)
        updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined)
        updateData.last_name = updates.lastName;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.addressLine1 !== undefined)
        updateData.address_line_1 = updates.addressLine1;
      if (updates.addressLine2 !== undefined)
        updateData.address_line_2 = updates.addressLine2;
      if (updates.city !== undefined) updateData.city = updates.city;
      if (updates.region !== undefined) updateData.region = updates.region;
      if (updates.postalCode !== undefined)
        updateData.postal_code = updates.postalCode;
      if (updates.country !== undefined) updateData.country = updates.country;
      if (updates.isDefault !== undefined)
        updateData.is_default = updates.isDefault;

      const { data, error } = await this.supabase
        .from("user_addresses")
        .update(updateData)
        .eq("id", addressId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update address: ${error.message}`);
      }

      return this.mapToUserAddress(data);
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("user_addresses")
        .delete()
        .eq("id", addressId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to delete address: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<void> {
    try {
      // First, unset all default addresses for the user
      await this.unsetAllDefaultAddresses(userId);

      // Then set the specified address as default
      const { error } = await this.supabase
        .from("user_addresses")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", addressId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to set default address: ${error.message}`);
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  }

  async getDefaultAddress(userId: string): Promise<UserAddress | null> {
    try {
      const { data, error } = await this.supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .eq("is_default", true)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapToUserAddress(data);
    } catch (error) {
      console.error("Error fetching default address:", error);
      return null;
    }
  }

  private async unsetAllDefaultAddresses(userId: string): Promise<void> {
    await this.supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("is_default", true);
  }

  private mapToUserAddress(data: any): UserAddress {
    return new UserAddress(
      data.id,
      data.user_id,
      data.type as AddressType,
      data.first_name,
      data.last_name,
      data.phone,
      data.address_line_1,
      data.address_line_2,
      data.city,
      data.region,
      data.postal_code,
      data.country,
      data.is_default,
      new Date(data.created_at),
      new Date(data.updated_at),
    );
  }
}
