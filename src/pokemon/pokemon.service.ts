import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
@Injectable()
export class PokemonService {

  // Solo en el constructor se hace la inyeccion de dependencias
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()
      const pokemon = await this.pokemonModel.create(createPokemonDto)
  
      return pokemon
    } catch (error) {
      this.handlerExceptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v')
  }

  async findOne(term: string) {
    let pokemon: Pokemon

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({no: term})
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()})
    }

    if (!pokemon)
      throw new NotFoundException('Pokemon not found')

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    let pokemon = await this.findOne(term)
    if (updatePokemonDto.name)
      updatePokemonDto.name.toLowerCase()

    try {
      await pokemon.updateOne(updatePokemonDto, {new: true})
  
      return {...pokemon.toJSON(), ...updatePokemonDto}
    } catch (error) {
      this.handlerExceptions(error)
    }
  }

  async remove(id: string) {
    const result = await this.pokemonModel.findByIdAndDelete(id)
    if (!result)
      throw new NotFoundException('Pokemon not found')
    
    return result
  }

  private handlerExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon already exists ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error)

    throw new InternalServerErrorException("Can't update pokemon - check server logs")
  }
}
